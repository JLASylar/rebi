// ════════════════════════════ MP4 合成 ════════════════════════════
// B站 1080P 以上（含 4K）只给音画分开的两个分片 MP4（fMP4：ftyp + moov + sidx + 一串 moof/mdat）。
// 这里把它们读出来，重排成一个普通的 MP4（moov 在前、一个 mdat、完整的样本表），
// 这样 QuickTime、系统播放器、剪辑软件都能直接开、能拖进度。不转码，只搬样本，所以很快。
// 规格依据：ISO/IEC 14496-12（ISO 基本媒体文件格式）。

const MP4 = (() => {
  const TEXT = new TextEncoder();
  const fourcc = (bytes, at) => String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);

  /** 读 64 位无符号整数（JS 数字精度够到 2^53，文件和时长都用不完） */
  const u64 = (view, at) => view.getUint32(at) * 2 ** 32 + view.getUint32(at + 4);

  /** 列出 [start, end) 范围里的盒子：{ type, start, body（内容起点）, end } */
  const boxes = (bytes, view, start, end) => {
    const list = [];
    let at = start;
    while (at + 8 <= end) {
      let size = view.getUint32(at);
      let body = at + 8;
      if (size === 1) {
        size = u64(view, at + 8);
        body = at + 16;
      } else if (size === 0) {
        size = end - at;
      }
      if (size < 8 || at + size > end) break;
      list.push({ type: fourcc(bytes, at + 4), start: at, body, end: at + size });
      at += size;
    }
    return list;
  };
  const child = (bytes, view, parent, type) => boxes(bytes, view, parent.body, parent.end).find((box) => box.type === type);
  /** 按路径往下找：path('moov', 'trak', 'mdia') */
  const path = (bytes, view, parent, ...types) =>
    types.reduce((box, type) => box && child(bytes, view, box, type), parent);

  /**
   * B站的 HEVC 标成 hev1（参数集可以夹在影片里），苹果的播放器（QuickTime、Safari）只认 hvc1。
   * 参数集都已经在 hvcC 里，改个标签就行（ffmpeg 的 -tag:v hvc1 也是这么做）。复制一份再改，不动原缓冲区
   */
  const appleFriendly = (stsd) => {
    // stsd：盒头 8 + 版本旗标 4 + 条目数 4，第一个条目的类型在第 20 字节
    if (stsd.length < 24 || fourcc(stsd, 20) !== 'hev1') return stsd;
    const copy = stsd.slice();
    copy.set(TEXT.encode('hvc1'), 20);
    return copy;
  };

  /**
   * 读一个只有一条轨道的分片 MP4（B站的 .m4s）。
   * 返回轨道的描述（直接沿用原文件的盒子）和全部样本在原文件里的位置。
   */
  const readTrack = (buffer) => {
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);
    const top = boxes(bytes, view, 0, bytes.length);
    const ftyp = top.find((box) => box.type === 'ftyp');
    const moov = top.find((box) => box.type === 'moov');
    if (!moov) throw new Error('moov missing');
    const trak = child(bytes, view, moov, 'trak');
    const mdia = child(bytes, view, trak, 'mdia');
    const mdhd = child(bytes, view, mdia, 'mdhd');
    const hdlr = child(bytes, view, mdia, 'hdlr');
    const minf = child(bytes, view, mdia, 'minf');
    const stsd = path(bytes, view, minf, 'stbl', 'stsd');
    const tkhd = child(bytes, view, trak, 'tkhd');
    if (!mdhd || !hdlr || !minf || !stsd || !tkhd) throw new Error('track boxes missing');
    const raw = (box) => (box ? bytes.subarray(box.start, box.end) : null);

    const mdhdVersion = bytes[mdhd.body];
    const timescale = view.getUint32(mdhd.body + (mdhdVersion === 1 ? 20 : 12));
    const language = view.getUint16(mdhd.body + (mdhdVersion === 1 ? 32 : 20));
    const handler = fourcc(bytes, hdlr.body + 8);

    // trex 给这条轨道的默认值（tfhd 里没写的就用它）
    const trex = path(bytes, view, moov, 'mvex', 'trex');
    const defaults = trex
      ? { duration: view.getUint32(trex.body + 12), size: view.getUint32(trex.body + 16), flags: view.getUint32(trex.body + 20) }
      : { duration: 0, size: 0, flags: 0 };

    // 原文件的编辑表：只关心第一段从媒体的哪个时间开始（AAC 开头的预滚样本靠它跳过）
    let mediaTime = 0;
    const elst = path(bytes, view, trak, 'edts', 'elst');
    if (elst && view.getUint32(elst.body + 4) > 0) {
      const version = bytes[elst.body];
      mediaTime = version === 1 ? Number(view.getBigInt64(elst.body + 16)) : view.getInt32(elst.body + 12);
      if (mediaTime < 0) mediaTime = 0;
    }

    // ── 样本：逐个 moof 读 tfhd / tfdt / trun ──
    const samples = [];
    const runs = []; // 每个 trun 是一段连续的样本：[第一个样本的序号, 个数]
    let nextDts = 0;
    for (const moof of top.filter((box) => box.type === 'moof')) {
      for (const traf of boxes(bytes, view, moof.body, moof.end).filter((box) => box.type === 'traf')) {
        const tfhd = child(bytes, view, traf, 'tfhd');
        const tfhdFlags = view.getUint32(tfhd.body) & 0xffffff;
        let at = tfhd.body + 8;
        let base = moof.start;
        if (tfhdFlags & 0x1) {
          base = u64(view, at);
          at += 8;
        }
        if (tfhdFlags & 0x2) at += 4;
        const trackDefaults = { ...defaults };
        if (tfhdFlags & 0x8) (trackDefaults.duration = view.getUint32(at)), (at += 4);
        if (tfhdFlags & 0x10) (trackDefaults.size = view.getUint32(at)), (at += 4);
        if (tfhdFlags & 0x20) trackDefaults.flags = view.getUint32(at);

        const tfdt = child(bytes, view, traf, 'tfdt');
        if (tfdt) nextDts = bytes[tfdt.body] === 1 ? u64(view, tfdt.body + 4) : view.getUint32(tfdt.body + 4);

        let dataAt = base;
        for (const trun of boxes(bytes, view, traf.body, traf.end).filter((box) => box.type === 'trun')) {
          const version = bytes[trun.body];
          const flags = view.getUint32(trun.body) & 0xffffff;
          const count = view.getUint32(trun.body + 4);
          let p = trun.body + 8;
          if (flags & 0x1) (dataAt = base + view.getInt32(p)), (p += 4);
          let firstFlags = null;
          if (flags & 0x4) (firstFlags = view.getUint32(p)), (p += 4);
          const first = samples.length;
          for (let i = 0; i < count; i++) {
            const duration = flags & 0x100 ? view.getUint32((p += 4) - 4) : trackDefaults.duration;
            const size = flags & 0x200 ? view.getUint32((p += 4) - 4) : trackDefaults.size;
            let sampleFlags = flags & 0x400 ? view.getUint32((p += 4) - 4) : trackDefaults.flags;
            if (i === 0 && firstFlags !== null) sampleFlags = firstFlags;
            let cto = 0;
            if (flags & 0x800) cto = version === 0 ? view.getUint32((p += 4) - 4) : view.getInt32((p += 4) - 4);
            samples.push({ offset: dataAt, size, duration, cto, sync: !(sampleFlags & 0x10000), dts: nextDts });
            dataAt += size;
            nextDts += duration;
          }
          if (count) runs.push([first, count]);
        }
      }
    }
    if (!samples.length) throw new Error('no samples');
    if (samples[samples.length - 1].offset + samples[samples.length - 1].size > bytes.length) throw new Error('truncated');

    return {
      bytes,
      handler,
      timescale,
      language,
      mediaTime,
      brand: ftyp ? fourcc(bytes, ftyp.body) : 'isom',
      tkhd: raw(tkhd),
      hdlr: raw(hdlr),
      header: raw(child(bytes, view, minf, handler === 'vide' ? 'vmhd' : 'smhd')),
      dinf: raw(child(bytes, view, minf, 'dinf')),
      stsd: appleFriendly(raw(stsd)),
      samples,
      runs,
      duration: samples.reduce((total, sample) => total + sample.duration, 0),
    };
  };

  // ── 写盒子 ──
  const concat = (parts) => {
    const out = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
    let at = 0;
    for (const part of parts) out.set(part, at), (at += part.length);
    return out;
  };
  const box = (type, ...parts) => {
    const payload = concat(parts.filter(Boolean));
    const out = new Uint8Array(payload.length + 8);
    new DataView(out.buffer).setUint32(0, out.length);
    out.set(TEXT.encode(type), 4);
    out.set(payload, 8);
    return out;
  };
  /** 一串 32 位整数（负数照 int32 写） */
  const u32s = (...values) => {
    const out = new Uint8Array(values.length * 4);
    const view = new DataView(out.buffer);
    values.forEach((value, i) => view.setUint32(i * 4, value >>> 0));
    return out;
  };
  const u64s = (...values) => {
    const out = new Uint8Array(values.length * 8);
    const view = new DataView(out.buffer);
    values.forEach((value, i) => {
      view.setUint32(i * 8, Math.floor(value / 2 ** 32));
      view.setUint32(i * 8 + 4, value >>> 0);
    });
    return out;
  };
  const fullBox = (type, version, flags, ...parts) => box(type, u32s(((version << 24) | flags) >>> 0), ...parts);
  /** 相邻相同的值合并成 [次数, 值] */
  const runLength = (values) => {
    const out = [];
    for (const value of values) {
      const last = out[out.length - 1];
      if (last && last[1] === value) last[0]++;
      else out.push([1, value]);
    }
    return out;
  };
  const MATRIX = u32s(0x10000, 0, 0, 0, 0x10000, 0, 0, 0, 0x40000000);
  const MOVIE_TIMESCALE = 1000;

  /** 原文件的 tkhd：换轨道编号和时长，其余（宽高、音量、矩阵）照抄 */
  const trackHeader = (track, id, movieDuration) => {
    const version = track.tkhd[8];
    const tail = track.tkhd.subarray(version === 1 ? 8 + 36 : 8 + 24);
    return fullBox('tkhd', 0, 3, u32s(0, 0, id, 0, movieDuration), tail);
  };

  /**
   * 把几条轨道（readTrack 的结果）合成一个 MP4。
   * 返回 Blob 的组成部分（大段样本直接引用原缓冲区，不再复制一份）。
   */
  const build = (tracks) => {
    // 每个 trun 当一个块；按开始时间把各轨道的块交错排进 mdat
    const chunks = [];
    tracks.forEach((track, index) => {
      for (const [first, count] of track.runs) {
        chunks.push({ track: index, first, count, time: track.samples[first].dts / track.timescale });
      }
    });
    chunks.sort((a, b) => a.time - b.time || a.track - b.track);
    const payload = chunks.reduce((total, chunk) => {
      const samples = tracks[chunk.track].samples;
      let size = 0;
      for (let i = chunk.first; i < chunk.first + chunk.count; i++) size += samples[i].size;
      chunk.size = size;
      return total + size;
    }, 0);
    const large = payload + 16 + 1e6 > 0xffffffff;

    const ftyp = box('ftyp', TEXT.encode('isom'), u32s(0x200), TEXT.encode('isomiso2avc1mp41'));
    const movieDuration = Math.max(
      ...tracks.map((track) => Math.round(((track.duration - track.mediaTime) * MOVIE_TIMESCALE) / track.timescale)),
    );

    const moovWith = (chunkOffsets) => {
      const traks = tracks.map((track, index) => {
        const samples = track.samples;
        const own = chunks.filter((chunk) => chunk.track === index);
        const trackDuration = Math.round(((track.duration - track.mediaTime) * MOVIE_TIMESCALE) / track.timescale);

        const stts = runLength(samples.map((sample) => sample.duration));
        const ctts = samples.some((sample) => sample.cto) ? runLength(samples.map((sample) => sample.cto)) : null;
        const cttsVersion = ctts && ctts.some(([, value]) => value < 0) ? 1 : 0;
        const syncs = samples.every((sample) => sample.sync) ? null : samples.flatMap((sample, i) => (sample.sync ? [i + 1] : []));
        const stsc = [];
        own.forEach((chunk, i) => {
          if (!stsc.length || stsc[stsc.length - 1][1] !== chunk.count) stsc.push([i + 1, chunk.count]);
        });
        const offsets = own.map((chunk) => chunkOffsets.get(chunk) || 0);

        const stbl = box(
          'stbl',
          track.stsd,
          fullBox('stts', 0, 0, u32s(stts.length, ...stts.flat())),
          ctts && fullBox('ctts', cttsVersion, 0, u32s(ctts.length, ...ctts.flat())),
          syncs && fullBox('stss', 0, 0, u32s(syncs.length, ...syncs)),
          fullBox('stsc', 0, 0, u32s(stsc.length, ...stsc.flatMap(([firstChunk, count]) => [firstChunk, count, 1]))),
          fullBox('stsz', 0, 0, u32s(0, samples.length, ...samples.map((sample) => sample.size))),
          large ? fullBox('co64', 0, 0, u32s(offsets.length), u64s(...offsets)) : fullBox('stco', 0, 0, u32s(offsets.length, ...offsets)),
        );
        const dinf = track.dinf || box('dinf', fullBox('dref', 0, 0, u32s(1), fullBox('url ', 0, 1)));
        const mediaDuration = track.duration;
        const mdhd =
          mediaDuration > 0xffffffff
            ? fullBox('mdhd', 1, 0, u64s(0, 0), u32s(track.timescale), u64s(mediaDuration), u32s(track.language << 16))
            : fullBox('mdhd', 0, 0, u32s(0, 0, track.timescale, mediaDuration, track.language << 16));
        // 原文件说要跳过开头一段（AAC 预滚）的，照样写编辑表
        const edts =
          track.mediaTime > 0 && box('edts', fullBox('elst', 0, 0, u32s(1, trackDuration, track.mediaTime, 0x10000)));
        return box(
          'trak',
          trackHeader(track, index + 1, trackDuration),
          edts,
          box('mdia', mdhd, track.hdlr, box('minf', track.header, dinf, stbl)),
        );
      });
      const mvhd = fullBox(
        'mvhd',
        0,
        0,
        u32s(0, 0, MOVIE_TIMESCALE, movieDuration, 0x10000),
        // 音量 1.0（0x0100）、两段保留位
        new Uint8Array([0x01, 0x00, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
        MATRIX,
        new Uint8Array(24),
        u32s(tracks.length + 1),
      );
      return box('moov', mvhd, ...traks);
    };

    // 先用占位的偏移量算出 moov 多大（偏移量是定长的），再填真正的值
    const placeholder = moovWith(new Map());
    const mdatHeader = large ? concat([u32s(1), TEXT.encode('mdat'), u64s(payload + 16)]) : concat([u32s(payload + 8), TEXT.encode('mdat')]);
    let at = ftyp.length + placeholder.length + mdatHeader.length;
    const offsets = new Map();
    for (const chunk of chunks) offsets.set(chunk, at), (at += chunk.size);
    const moov = moovWith(offsets);

    const parts = [ftyp, moov, mdatHeader];
    for (const chunk of chunks) {
      const track = tracks[chunk.track];
      const samples = track.samples;
      const firstSample = samples[chunk.first];
      const lastSample = samples[chunk.first + chunk.count - 1];
      // 一个 trun 里的样本在原文件里一般是连着的：整段引用；不连着就逐个
      if (lastSample.offset + lastSample.size - firstSample.offset === chunk.size) {
        parts.push(track.bytes.subarray(firstSample.offset, firstSample.offset + chunk.size));
      } else {
        for (let i = chunk.first; i < chunk.first + chunk.count; i++) {
          parts.push(track.bytes.subarray(samples[i].offset, samples[i].offset + samples[i].size));
        }
      }
    }
    return parts;
  };

  return { readTrack, build };
})();
