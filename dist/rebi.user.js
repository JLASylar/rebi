// ==UserScript==
// @name         Re:Bi 比利重啟
// @namespace    https://space.bilibili.com/5094278
// @version      1.2.3
// @author       蘋果大王
// @description  B站寬屏、大寶鑑首頁、淨化、評論區 IP 屬地與性別、用戶備註、直播淨化、彈幕查詢、自訂快捷鍵、標題屏蔽詞
// @name:zh-CN   Re:Bi 比利重启
// @name:en      Re:Bi
// @name:ja      Re:Bi
// @description:zh-CN B站宽屏、大宝鉴首页、净化、评论区 IP 属地与性别、用户备注、直播净化、弹幕查询、自定义快捷键、标题屏蔽词
// @description:en Bilibili, rebooted: widescreen layout, showcase home, cleanup, comment IP location, user notes, custom shortcuts
// @description:ja ビリビリをもう一度：ワイドレイアウト、ショーケースホーム、クリーンアップ、コメントの IP 所在地と性別、ユーザーメモ、ライブのクリーンアップ、弾幕検索、ショートカット、タイトルの NG ワード
// @license      PolyForm-Noncommercial-1.0.0; https://polyformproject.org/licenses/noncommercial/1.0.0
// @homepageURL  https://rebi.appleking.net/
// @supportURL   https://github.com/JLASylar/rebi/issues
// @downloadURL  https://raw.githubusercontent.com/JLASylar/rebi/main/dist/rebi.user.js
// @updateURL    https://raw.githubusercontent.com/JLASylar/rebi/main/dist/rebi.user.js
// @icon         https://www.bilibili.com/favicon.ico
// @match        http*://*.bilibili.com/*
// @exclude      https://*.hdslb.com/*
// @exclude      *://passport.bilibili.com/*
// @exclude      *://pay.bilibili.com/*
// @exclude      *://account.bilibili.com/*
// @exclude      *://api.bilibili.com/*
// @exclude      *://app.bilibili.com/*
// @exclude      *://show.bilibili.com/*
// @exclude      *://mall.bilibili.com/*
// @exclude      *://link.bilibili.com/*
// @exclude      *://member.bilibili.com/*
// @exclude      *://cm.bilibili.com/*
// @exclude      *://data.bilibili.com/*
// @connect      api.bilibili.com
// @connect      hdslb.com
// @grant        GM_addValueChangeListener
// @grant        GM_deleteValue
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-start
// @compatible   safari 17.4+
// @compatible   chrome 120+
// @compatible   firefox 117+
// ==/UserScript==

(function () {
  'use strict';

  const BUILD = {"name": "Re:Bi", "version": "1.2.3", "author": "蘋果大王", "homepage": "https://space.bilibili.com/5094278", "target": "userscript", "download": true};

  const STYLES = {
    base: `:root {
    --bga-nav: 64px;
    --bga-gutter: min(var(--bga-gutter-size, 30px), 15vw);
  }`,
    cards: `#bga-card-tools {
    position: fixed;
    z-index: 100000;
    display: none;
    gap: 2px;
    margin: 0;
    padding: 3px;
    border-radius: 11px;
    background: rgb(22 22 24 / 0.6);
    box-shadow:
      0 6px 20px rgb(0 0 0 / 0.28),
      inset 0 0 0 0.5px rgb(255 255 255 / 0.18);
    backdrop-filter: saturate(180%) blur(16px);
    -webkit-backdrop-filter: saturate(180%) blur(16px);
  }
  #bga-card-tools[data-on] {
    display: flex;
    animation: bga-tools-in 0.16s cubic-bezier(0.2, 0.9, 0.3, 1.2);
  }
  @keyframes bga-tools-in {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.96);
    }
  }
  #bga-card-tools button {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    padding: 0;
    border: 0;
    border-radius: 8px;
    background: none;
    color: #fff;
    cursor: pointer;
    transition:
      background 0.15s,
      transform 0.1s;
  }
  #bga-card-tools button[hidden] {
    display: none;
  }
  #bga-card-tools button:hover {
    background: rgb(255 255 255 / 0.2);
  }
  #bga-card-tools button:active {
    transform: scale(0.92);
  }
  #bga-card-tools button[data-busy] {
    opacity: 0.5;
    pointer-events: none;
  }
  #bga-card-tools button[data-active] {
    background: #ff453a;
  }
  #bga-card-tools svg {
    width: 15px;
    height: 15px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
    pointer-events: none;
  }
  #bga-card-zoom {
    position: fixed;
    z-index: 100001;
    display: none;
    overflow: hidden;
    padding: 0;
    border-radius: 14px;
    background: #111;
    box-shadow:
      0 24px 80px rgb(0 0 0 / 0.5),
      0 0 0 0.5px rgb(255 255 255 / 0.2);
    pointer-events: none;
  }
  #bga-card-zoom[data-on] {
    display: block;
    animation: bga-zoom-in 0.18s cubic-bezier(0.2, 0.9, 0.3, 1.1);
  }
  @keyframes bga-zoom-in {
    from {
      opacity: 0;
      transform: scale(0.97);
    }
  }
  #bga-card-zoom img {
    display: block;
    width: 100%;
    height: auto;
  }
  @media (prefers-reduced-motion: reduce) {
    #bga-card-tools[data-on],
    #bga-card-zoom[data-on] {
      animation: none;
    }
  }
  [data-bga-title-hidden],
  [data-bga-feed-hidden] {
    display: none !important;
  }
  [data-bga-up-blocked] {
    opacity: 0.22 !important;
    filter: grayscale(1);
    transition: opacity 0.2s;
  }`,
    clean: `:root[data-bga~="no-gray"],
  :root[data-bga~="no-gray"] body {
    filter: none !important;
  }
  :root[data-bga~="no-ads"] {
    :is(.feed-card, .bili-video-card):has(a[href*="cm.bilibili.com"]) {
      display: none !important;
    }
    .feed-card:has(> .bili-video-card:is(:empty, :has(> div:empty))) {
      display: none !important;
    }
    :is(
      #slide_ad,
      .ad-report,
      .ad-floor-exp,
      .right-bottom-banner,
      .video-card-ad-small,
      .video-page-game-card-small,
      .video-page-special-card-small
    ) {
      display: none !important;
    }
    :is(#activity_vote, .activity-m-v1) {
      display: none !important;
    }
    a[href*="cm.bilibili.com"],
    .adblock-tips {
      display: none !important;
    }
  }`,
    download: `.bga-dl-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-right: 18px;
    color: var(--text2, #61666d);
    font-size: 13px;
    cursor: pointer;
    transition: color 0.2s;
    svg {
      width: 16px;
      height: 16px;
    }
    &:hover {
      color: var(--brand_blue, #00aeec);
    }
  }
  .bga-dl {
    position: fixed;
    z-index: 100010;
    box-sizing: border-box;
    width: 320px;
    padding: 10px;
    border-radius: 14px;
    color: var(--bga-fg);
    background: var(--bga-bg);
    box-shadow: var(--bga-shadow);
    backdrop-filter: saturate(180%) blur(24px);
    -webkit-backdrop-filter: saturate(180%) blur(24px);
    font-size: 13px;
    animation: bga-dl-in 0.22s var(--bga-spring);
  }
  @keyframes bga-dl-in {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .bga-dl {
      animation: none;
    }
  }
  .bga-dl-head {
    padding: 4px 8px 8px;
    font-weight: 600;
  }
  .bga-dl-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding: 9px 10px;
    border: 0;
    border-radius: 9px;
    color: inherit;
    background: none;
    font: inherit;
    text-align: left;
    cursor: pointer;
    &:hover:not(:disabled) {
      background: var(--bga-accent-soft);
    }
    &:disabled {
      opacity: 0.45;
      cursor: default;
    }
  }
  .bga-dl-name {
    font-weight: 500;
  }
  .bga-dl-detail {
    color: var(--bga-fg2);
    font-family: var(--bga-mono);
    font-size: 12px;
    white-space: nowrap;
  }
  .bga-dl-note {
    padding: 8px 10px 4px;
    color: var(--bga-fg3);
    font-size: 12px;
    line-height: 1.5;
  }
  .bga-dl-bar {
    height: 6px;
    margin: 4px 8px 8px;
    overflow: hidden;
    border-radius: 3px;
    background: var(--bga-ctl);
    i {
      display: block;
      width: 0;
      height: 100%;
      border-radius: inherit;
      background: var(--bga-accent);
      transition: width 0.3s ease-out;
    }
  }
  .bga-dl-status {
    padding: 0 8px 8px;
    color: var(--bga-fg2);
    font-family: var(--bga-mono);
    font-size: 12px;
  }
  .bga-dl-cancel {
    margin: 0 8px 4px;
    padding: 5px 14px;
    border: 0;
    border-radius: 8px;
    color: var(--bga-fg);
    background: var(--bga-ctl);
    font: inherit;
    cursor: pointer;
    &:hover {
      color: #fff;
      background: var(--bga-danger);
    }
  }`,
    fontface: `@font-face {
    font-family: HarmonyOS_Regular;
    font-weight: 400;
    src: local("PingFangSC-Regular"), local("PingFang SC");
  }
  @font-face {
    font-family: HarmonyOS_Medium;
    font-weight: 500;
    src: local("PingFangSC-Medium"), local("PingFang SC");
  }
  @font-face {
    font-family: HarmonyOS_Bold;
    font-weight: 600;
    src: local("PingFangSC-Semibold"), local("PingFang SC");
  }`,
    home: `:root[data-bga~="home-hero"] {
    .bili-header__banner {
      height: max(100vh, 560px) !important;
      min-height: 0 !important;
      max-height: none !important;
      background: #0b0b0d !important;
    }
    .bili-header__banner > * {
      display: none !important;
    }
    .bili-header__bar,
    .header-channel {
      transition: transform 0.32s cubic-bezier(0.3, 0.7, 0.2, 1);
    }
    .bili-header__bar {
      position: fixed !important;
    }
  }
  :root[data-bga~="home-hero"][data-bga~="home-nav-hidden"] :is(.bili-header__bar, .header-channel) {
    transform: translateY(-130px);
  }
  :root[data-bga~="home-hero"][data-bga~="home-nav-over-hero"] :is(.header-channel, .palette-button-outer) {
    display: none !important;
  }
  #bga-hero {
    position: absolute;
    z-index: 2;
    inset: 0 0 auto;
    overflow: hidden;
    height: max(100vh, 560px);
    background: #0b0b0d;
    color: #fff;
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
    a {
      color: inherit;
      text-decoration: none;
    }
    .bga-hero-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      transform: scale(1.04);
      transition:
        opacity 0.9s ease,
        transform 9s linear;
    }
    .bga-hero-bg[data-on] {
      opacity: 1;
      transform: none;
    }
    .bga-hero-media {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .bga-hero-video {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      transition: opacity 0.8s ease;
      pointer-events: none;
    }
    .bga-hero-video[data-on] {
      opacity: 1;
      transition: opacity 0.8s ease;
    }
    .bga-hero-round.bga-hero-sound {
      display: none;
    }
    &[data-previewing] .bga-hero-round.bga-hero-sound {
      display: grid;
      animation: bga-hero-pop 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.2);
    }
    &[data-watching] {
      cursor: pointer;
    }
    .bga-hero-left {
      transition:
        opacity 0.5s ease,
        transform 0.6s cubic-bezier(0.2, 0.9, 0.25, 1);
    }
    &[data-previewing][data-idle] .bga-hero-left {
      opacity: 0;
      transform: translateY(12px);
      pointer-events: none;
    }
    &[data-previewing][data-idle] .bga-hero-shade {
      opacity: 0.25;
      transition: opacity 0.8s ease;
    }
    &[data-previewing][data-idle] .bga-hero-side {
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.6s ease;
    }
    &[data-previewing][data-idle] {
      cursor: none;
    }
    .bga-hero-arm {
      position: absolute;
      bottom: 28px;
      left: 50%;
      overflow: hidden;
      padding: 7px 16px 9px;
      border-radius: 999px;
      background: rgb(0 0 0 / 0.5);
      color: #fff;
      font-size: 13px;
      opacity: 0;
      transform: translate(-50%, 8px);
      transition:
        opacity 0.25s,
        transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.2);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      pointer-events: none;
    }
    .bga-hero-arm i {
      position: absolute;
      inset: auto 0 0;
      height: 2px;
      background: var(--bga-accent);
      transform: scaleX(0);
      transform-origin: left;
    }
    &[data-arming] .bga-hero-arm {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    &[data-arming] .bga-hero-arm i {
      animation: bga-hero-fill 1.5s linear forwards;
    }
    .bga-hero-watchbar {
      position: absolute;
      inset: auto 0 0;
      height: 3px;
      background: rgb(255 255 255 / 0.12);
      opacity: 0;
      transition: opacity 0.4s;
      pointer-events: none;
    }
    .bga-hero-watchbar i {
      display: block;
      height: 100%;
      background: var(--bga-accent);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s linear;
    }
    &[data-watching] .bga-hero-watchbar {
      opacity: 1;
    }
    .bga-hero-video:not([data-on]) {
      transition: none;
    }
    .bga-hero-shade {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(to bottom, rgb(0 0 0 / 0.62), rgb(0 0 0 / 0.18) 16%, transparent 30%),
        linear-gradient(to top, rgb(0 0 0 / 0.9), rgb(0 0 0 / 0.62) 28%, rgb(0 0 0 / 0.2) 52%, transparent 66%),
        linear-gradient(to right, rgb(0 0 0 / 0.62), rgb(0 0 0 / 0.24) 36%, transparent 60%);
      pointer-events: none;
    }
    .bga-hero-left {
      position: absolute;
      bottom: 56px;
      left: max(var(--bga-gutter), 48px);
      width: min(46vw, 640px);
    }
    .bga-hero-info {
      text-shadow: 0 1px 12px rgb(0 0 0 / 0.5);
      animation: bga-hero-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .bga-hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 10px;
      align-items: center;
      color: rgb(255 255 255 / 0.82);
      font-size: 13px;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
    }
    .bga-hero-meta b {
      color: var(--bga-accent);
      font-weight: 700;
      letter-spacing: 0.06em;
    }
    .bga-hero-title {
      display: -webkit-box;
      overflow: hidden;
      margin: 10px 0 14px;
      font-size: clamp(28px, 3.3vw, 52px);
      font-weight: 800;
      line-height: 1.16;
      letter-spacing: -0.01em;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }
    .bga-hero-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      font-size: 12.5px;
    }
    .bga-hero-tags > * {
      padding: 4px 11px;
      border-radius: 999px;
      background: rgb(255 255 255 / 0.16);
      text-shadow: none;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    .bga-hero-tags > a:hover {
      background: rgb(255 255 255 / 0.3);
    }
    .bga-hero-desc {
      display: -webkit-box;
      overflow: hidden;
      margin: 14px 0 0;
      color: rgb(255 255 255 / 0.8);
      font-size: 14px;
      line-height: 1.6;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
    .bga-hero-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-top: 22px;
      text-shadow: none;
    }
    .bga-hero-play {
      display: inline-flex;
      gap: 10px;
      align-items: center;
      height: 46px;
      padding: 0 30px 0 24px;
      border-radius: 999px;
      background: #fff;
      color: #111;
      font-size: 16px;
      font-weight: 650;
      transition:
        transform 0.18s cubic-bezier(0.2, 0.9, 0.3, 1.2),
        background 0.15s;
    }
    .bga-hero-play:hover {
      background: var(--bga-accent);
      color: #fff;
      transform: scale(1.04);
    }
    .bga-hero-round {
      display: grid;
      place-items: center;
      width: 46px;
      height: 46px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: rgb(255 255 255 / 0.16);
      color: #fff;
      cursor: pointer;
      transition:
        background 0.15s,
        transform 0.18s cubic-bezier(0.2, 0.9, 0.3, 1.2);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    .bga-hero-round:hover {
      background: rgb(255 255 255 / 0.32);
      transform: scale(1.06);
    }
    svg {
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .bga-hero-play svg {
      fill: currentColor;
      stroke: none;
    }
    .bga-hero-dots {
      display: flex;
      gap: 6px;
      margin-top: 22px;
    }
    .bga-hero-dots button {
      position: relative;
      overflow: hidden;
      flex: 1 1 0;
      min-width: 0;
      max-width: 34px;
      height: 4px;
      padding: 0;
      border: 0;
      border-radius: 2px;
      background: rgb(255 255 255 / 0.28);
      cursor: pointer;
    }
    .bga-hero-dots button::after {
      position: absolute;
      inset: 0;
      background: #fff;
      content: "";
      transform: scaleX(0);
      transform-origin: left;
    }
    .bga-hero-dots button[data-on]::after {
      animation: bga-hero-fill var(--bga-hero-interval, 8s) linear forwards;
    }
    &[data-paused] .bga-hero-dots button[data-on]::after {
      animation-play-state: paused;
    }
    .bga-hero-side {
      position: absolute;
      right: max(var(--bga-gutter), 48px);
      bottom: 56px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      width: min(44vw, 780px);
    }
    .bga-hero-side-head {
      display: flex;
      align-items: center;
      margin-bottom: 14px;
      font-size: 19px;
      font-weight: 700;
      text-shadow: 0 1px 10px rgb(0 0 0 / 0.5);
    }
    .bga-hero-side-head span {
      flex: 1;
    }
    .bga-hero-side-head button {
      width: 34px;
      height: 34px;
      margin-left: 8px;
    }
    .bga-hero-row {
      display: flex;
      align-items: flex-end;
      gap: 14px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
    }
    .bga-hero-row::-webkit-scrollbar {
      display: none;
    }
    .bga-hero-card {
      flex: 0 0 calc((100% - 28px) / 3);
      min-width: 0;
      scroll-snap-align: start;
    }
    .bga-hero-card img {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 9;
      border-radius: 10px;
      background: rgb(255 255 255 / 0.12);
      box-shadow: 0 8px 24px rgb(0 0 0 / 0.35);
      object-fit: cover;
      transition:
        transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.1),
        box-shadow 0.22s;
    }
    .bga-hero-card:hover img {
      box-shadow:
        0 0 0 2px #fff,
        0 12px 30px rgb(0 0 0 / 0.45);
      transform: translateY(-3px);
    }
    .bga-hero-card b {
      display: block;
      overflow: hidden;
      margin-top: 9px;
      font-size: 14px;
      font-weight: 650;
      text-overflow: ellipsis;
      text-shadow: 0 1px 8px rgb(0 0 0 / 0.6);
      white-space: nowrap;
    }
    .bga-hero-card small {
      display: block;
      overflow: hidden;
      margin-top: 2px;
      color: rgb(255 255 255 / 0.68);
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  @keyframes bga-hero-in {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
  }
  @keyframes bga-hero-pop {
    from {
      opacity: 0;
      transform: scale(0.6);
    }
  }
  @keyframes bga-hero-fill {
    to {
      transform: scaleX(1);
    }
  }
  @media (max-width: 1000px) {
    #bga-hero .bga-hero-side {
      display: none;
    }
    #bga-hero .bga-hero-left {
      width: calc(100vw - 96px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    #bga-hero .bga-hero-bg {
      transform: none;
      transition: opacity 0.01s;
    }
    #bga-hero .bga-hero-info {
      animation: none;
    }
  }
  :root[data-bga~="home-no-swipe"] .recommended-swipe {
    display: none !important;
  }
  :root[data-bga~="home-no-floor"] :is(.floor-single-card, .feed-card:has(.bili-live-card), .bili-video-card:has(.bili-live-card)) {
    display: none !important;
  }
  :root[data-bga~="home-hero-idle"] .bga-nav {
    opacity: 0;
    transform: translateY(-12px);
    pointer-events: none;
  }
  .bga-nav {
    transition:
      opacity 0.5s ease,
      transform 0.6s cubic-bezier(0.2, 0.9, 0.25, 1),
      background 0.3s;
  }`,
    live: `:root[data-bga~="live-clean"] :is(#welcome-area-bottom-vm, .web-player-icon-roomStatus) {
    display: none !important;
  }
  :root[data-bga~="live-no-rank"] {
    #rank-list-vm,
    #rank-list-ctnr-box {
      display: none !important;
    }
    #head-info-vm .right-module-measure:has(.rank-entries),
    #head-info-vm
      :is(
        .rank-entries,
        .popular-and-hot-rank,
        .hot-rank-wrap,
        .gift-planet-entry,
        .pk-act-rank-entry,
        .area-rank-entry
      ) {
      display: none !important;
    }
    body:not(.hide-aside-area) #aside-area-vm .chat-history-panel {
      flex: 1 1 0 !important;
      height: auto !important;
      min-height: 0;
    }
    #chat-history-list {
      padding-block-start: 10px !important;
    }
  }
  :root[data-bga~="live-no-gift-full"] {
    #full-screen-interactive-wrap,
    body:is(.player-full-win, .fullscreen-fix) #gift-control-vm,
    body.player-full-win #web-player__bottom-bar__container .gift-control-section,
    :fullscreen #web-player__bottom-bar__container .gift-control-section {
      display: none !important;
    }
    #fullscreen-danmaku-vm .fullscreen-danmaku {
      bottom: 6px !important;
    }
  }
  :root[data-bga~="live-no-gift"] {
    #gift-control-vm,
    .gift-control-section {
      display: none !important;
    }
    body:not(.player-full-win, .fullscreen-fix) .fullscreen-container-paddingbox {
      height: 0 !important;
    }
    body:not(.player-full-win, .fullscreen-fix) #fullscreen-container {
      grid-template-rows: minmax(0, 1fr) 0 !important;
      border-radius: 0 0 12px 12px;
    }
  }
  :root[data-bga~="live-no-ads"] {
    .flip-view,
    .banner-ctn,
    #bili-live-banner,
    #head-info-vm .right-module-measure:has(.activity-entry),
    #head-info-vm :is(.activity-gather-entry, .activity-entry, .task-box),
    #shop-popover-vm,
    .shop-popover,
    .ecommerce-entry,
    #hyperlink-card,
    #link-feed-card-popup,
    #activity-welcome-area-vm,
    .activity-welcome-section,
    .web-player-inject-wrap .announcement-wrapper,
    #sidebar-vm .side-bar-popup-cntr {
      display: none !important;
    }
  }
  :root[data-bga~="live-no-sidebar"] #sidebar-vm .side-bar-cntr {
    display: none !important;
  }
  :root[data-bga~="live-fill"] .live-room-app {
    --bga-live-nav: 64px;
    --bga-live-aside: 300px;
    .app-content {
      padding-top: var(--bga-live-nav) !important;
    }
    .app-body {
      width: auto !important;
      min-width: 0 !important;
      max-width: none !important;
      margin: 0 !important;
    }
    .player-and-aside-area {
      width: auto !important;
      margin: 0 !important;
    }
    #player-ctnr {
      width: calc(100% - var(--bga-live-aside)) !important;
    }
    .fullscreen-container-paddingbox {
      padding-top: calc(100vh - var(--bga-live-nav)) !important;
    }
    #head-info-vm {
      position: absolute !important;
      z-index: 20 !important;
      inset: 0 0 auto !important;
      width: auto !important;
      height: auto !important;
      padding-block: 10px 26px !important;
      padding-right: 64px !important;
      border: 0 !important;
      border-radius: 0 !important;
      background: linear-gradient(rgb(0 0 0 / 0.62), rgb(0 0 0 / 0.3) 55%, transparent) !important;
      box-shadow: none !important;
      color: #fff !important;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.35s 0.9s;
    }
    #player-ctnr:hover #head-info-vm,
    #head-info-vm:focus-within {
      opacity: 1;
      pointer-events: auto;
      transition-delay: 0s;
    }
    #head-info-vm :is(.heat-index-scroll, .live-skin-main-text, .live-skin-normal-text, .icon-font, .action-text, span) {
      color: rgb(255 255 255 / 0.86) !important;
    }
    #aside-area-vm {
      top: 0 !important;
      right: 0 !important;
      left: auto !important;
      height: calc(100vh - var(--bga-live-nav)) !important;
    }
  }`,
    marks: `.bga-memo {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    height: 18px;
    margin-left: 6px;
    padding: 0 7px;
    border-radius: 9px;
    background: rgb(251 114 153 / 0.13);
    color: #fb7299;
    font:
      500 12px/18px -apple-system,
      BlinkMacSystemFont,
      "PingFang SC",
      sans-serif;
    white-space: nowrap;
    vertical-align: middle;
    cursor: pointer;
    transition: background 0.15s;
  }
  .bga-memo:hover {
    background: rgb(251 114 153 / 0.24);
  }
  .bga-memo-add,
  .bga-cmt-block {
    margin-left: 6px;
    color: var(--text3, #9499a0);
    font:
      400 12px/18px -apple-system,
      BlinkMacSystemFont,
      "PingFang SC",
      sans-serif;
    white-space: nowrap;
    cursor: pointer;
    opacity: 0;
    transition:
      opacity 0.15s,
      color 0.15s;
  }
  #info:hover :is(.bga-memo-add, .bga-cmt-block) {
    opacity: 1;
  }
  .bga-memo-add:hover {
    color: #fb7299;
  }
  .bga-cmt-block:hover {
    color: #ff453a;
  }
  .bga-gender {
    margin-left: 5px;
    font:
      600 13px/1 -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    cursor: default;
  }
  .bga-gender[data-s="m"] {
    color: #0a84ff;
  }
  .bga-gender[data-s="f"] {
    color: #ff375f;
  }
  .bga-pill {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    height: 22px;
    margin-left: 8px;
    padding: 0 10px;
    border-radius: 11px;
    background: rgb(0 0 0 / 0.32);
    color: #fff;
    font:
      500 12px/22px -apple-system,
      BlinkMacSystemFont,
      "PingFang SC",
      sans-serif;
    white-space: nowrap;
    vertical-align: middle;
    backdrop-filter: saturate(180%) blur(12px);
    -webkit-backdrop-filter: saturate(180%) blur(12px);
  }
  button.bga-pill {
    border: 0;
    cursor: pointer;
    transition: background 0.15s;
  }
  button.bga-pill:hover {
    background: rgb(0 0 0 / 0.48);
  }`,
    nav: `:root[data-bga~="nav-own"] :is(.bili-header__bar, .link-navbar, #internationalHeader .mini-header) {
    visibility: hidden !important;
    pointer-events: none !important;
  }
  :root[data-bga~="nav-own"][data-bga~="page-player"] #biliMainHeader {
    display: none !important;
  }
  :root[data-bga~="nav-own"][data-bga~="page-search"] .search-input {
    display: none !important;
  }
  .bga-nav {
    --bga-pink: var(--brand_pink, #fb7299);
    --bga-ink: var(--text1, #18191c);
    --bga-dim: var(--text3, #9499a0);
    --bga-page: var(--bg1, #fff);
    --bga-tile: color-mix(in srgb, var(--bga-ink) 6%, var(--bga-page));
    --bga-tile-hover: color-mix(in srgb, var(--bga-ink) 13%, var(--bga-page));
    --bga-line: color-mix(in srgb, var(--bga-ink) 11%, transparent);
    --bga-ring: inset 0 0 0 1px var(--bga-line), inset 0 1px 0 rgb(255 255 255 / 0.06);
    --bga-ease: cubic-bezier(0.2, 0.9, 0.25, 1);
    --bga-spring: cubic-bezier(0.3, 1.5, 0.5, 1);
    position: fixed;
    z-index: 1002;
    inset: 0 0 auto;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 12px;
    height: var(--bga-nav, 64px);
    padding: 0 16px;
    background: var(--bga-page);
    color: var(--bga-ink);
    font-size: 14px;
    line-height: 1.4;
    transition: background 0.3s;
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
    [hidden] {
      display: none !important;
    }
    a {
      color: inherit;
      text-decoration: none;
    }
    button {
      margin: 0;
      border: 0;
      background: none;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    svg {
      flex: none;
      width: 20px;
      height: 20px;
    }
  }
  :root[data-bga~="page-player"] .bga-nav {
    position: relative;
    inset: auto;
    z-index: 100;
    margin-block: var(--bga-stage) 0;
  }
  :root[data-bga~="page-player"][data-bga~="nav-top"] .bga-nav {
    margin-block: 0 var(--bga-stage);
  }
  :root[data-bga~="page-player"][data-bga~="nav-sticky"] .bga-nav {
    position: sticky;
    top: 0;
  }
  :root[data-bga~="nav-clear"] .bga-nav {
    --bga-ink: #fff;
    --bga-dim: rgb(255 255 255 / 0.7);
    --bga-tile: rgb(0 0 0 / 0.36);
    --bga-tile-hover: rgb(0 0 0 / 0.56);
    --bga-line: rgb(255 255 255 / 0.16);
    background: transparent;
    .bga-nav-tile {
      backdrop-filter: saturate(160%) blur(18px);
      -webkit-backdrop-filter: saturate(160%) blur(18px);
    }
  }
  .bga-nav-tile {
    display: flex;
    flex: none;
    align-items: center;
    gap: 2px;
    height: 44px;
    margin: 0;
    padding: 0 5px;
    border-radius: 13px;
    background: var(--bga-tile);
    box-shadow: var(--bga-ring);
    transition:
      background 0.2s,
      box-shadow 0.3s var(--bga-ease);
  }
  .bga-nav-t {
    position: relative;
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    min-width: 34px;
    height: 34px;
    padding: 0 10px;
    border-radius: 9px;
    white-space: nowrap;
    transition:
      background 0.18s,
      transform 0.3s var(--bga-spring);
  }
  .bga-nav-i {
    width: 34px;
    padding: 0;
  }
  .bga-nav-t:hover,
  .bga-nav-t.bga-on,
  .bga-nav-t[aria-expanded="true"] {
    background: var(--bga-tile-hover);
  }
  .bga-nav-t:active {
    transform: scale(0.94);
  }
  .bga-nav-t::after {
    content: "";
    position: absolute;
    top: 4px;
    right: 4px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--bga-pink);
    opacity: 0;
    transform: scale(0);
    transition:
      transform 0.32s var(--bga-spring),
      opacity 0.12s;
    pointer-events: none;
  }
  .bga-nav-t:is(:hover, .bga-on, [aria-expanded="true"])::after {
    opacity: 1;
    transform: none;
  }
  .bga-nav-badge {
    position: absolute;
    top: 1px;
    right: 1px;
    min-width: 15px;
    height: 15px;
    padding: 0 4px;
    border-radius: 8px;
    background: var(--bga-pink);
    color: #1a0d12;
    font: 700 10px/15px ui-monospace, "SF Mono", Menlo, monospace;
    text-align: center;
    animation: bga-pop-dot 0.4s var(--bga-spring) backwards;
  }
  .bga-nav-badge.bga-nav-dot {
    top: 4px;
    right: 4px;
    min-width: 0;
    width: 6px;
    height: 6px;
    padding: 0;
  }
  .bga-nav-t:has(.bga-nav-badge:not([hidden]))::after {
    display: none;
  }
  .bga-nav-fold {
    display: flex;
    align-items: center;
    gap: 2px;
    max-width: 520px;
    transition:
      max-width 0.5s var(--bga-ease),
      opacity 0.28s,
      transform 0.5s var(--bga-ease);
  }
  .bga-closed .bga-nav-fold {
    max-width: 0;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
  }
  .bga-nav-left.bga-closed .bga-nav-fold {
    transform: translateX(-8px);
  }
  .bga-nav-right.bga-closed .bga-nav-fold {
    transform: translateX(8px);
  }
  .bga-nav-arrow {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 34px;
    padding: 0;
    border-radius: 6px;
    color: var(--bga-dim);
    opacity: 0.7;
    transition:
      opacity 0.18s,
      background 0.18s;
    svg {
      width: 16px;
      height: 16px;
      transition: transform 0.5s var(--bga-spring);
    }
  }
  .bga-nav-arrow:hover {
    background: var(--bga-tile-hover);
    opacity: 1;
  }
  .bga-nav-left.bga-closed .bga-nav-arrow svg,
  .bga-nav-right:not(.bga-closed) .bga-nav-arrow svg {
    transform: scaleX(-1);
  }
  .bga-nav-search {
    flex: 1 1 0;
    min-width: 120px;
    padding-left: 14px;
    cursor: text;
  }
  .bga-nav-search:hover {
    background: var(--bga-tile-hover);
  }
  .bga-nav-search:focus-within {
    background: var(--bga-page);
    box-shadow:
      inset 0 0 0 1.5px var(--bga-pink),
      0 0 0 4px color-mix(in srgb, var(--bga-pink) 16%, transparent);
  }
  :root[data-bga~="nav-clear"] .bga-nav-search:focus-within {
    background: rgb(0 0 0 / 0.62);
  }
  .bga-nav-input {
    flex: 1;
    min-width: 0;
    height: 34px;
    margin: 0;
    padding: 0;
    border: 0;
    outline: 0;
    background: none;
    color: inherit;
    font: inherit;
    -webkit-appearance: none;
    appearance: none;
  }
  .bga-nav-input::placeholder {
    color: var(--bga-dim);
  }
  .bga-nav-input::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }
  .bga-nav-face {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
    background: var(--bga-tile-hover);
  }
  .bga-nav-me {
    width: auto;
    padding: 0 2px;
  }
  .bga-nav-me.bga-in .bga-nav-login,
  .bga-nav-me:not(.bga-known) .bga-nav-login {
    display: none;
  }
  .bga-nav-me:not(.bga-known):not(.bga-in)::before {
    content: "";
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--bga-tile-hover);
  }
  .bga-nav-login {
    padding: 0 8px;
    color: var(--bga-pink);
    font-weight: 600;
  }
  .bga-nav-me .bga-nav-face {
    transition: transform 0.4s var(--bga-spring);
  }
  .bga-nav-me:is(:hover, [aria-expanded="true"]) .bga-nav-face {
    transform: scale(1.08);
  }
  .bga-nav-pop {
    --bga-ink: var(--text1, #18191c);
    --bga-dim: var(--text3, #9499a0);
    --bga-tile: color-mix(in srgb, var(--bga-ink) 6%, var(--bga-page));
    --bga-tile-hover: color-mix(in srgb, var(--bga-ink) 13%, var(--bga-page));
    --bga-line: color-mix(in srgb, var(--bga-ink) 11%, transparent);
    position: absolute;
    z-index: 2;
    top: calc(100% - 4px);
    padding: 10px;
    border-radius: 18px;
    background: color-mix(in srgb, var(--bga-page) 90%, transparent);
    box-shadow:
      inset 0 0 0 1px var(--bga-line),
      0 24px 60px rgb(0 0 0 / 0.34),
      0 2px 8px rgb(0 0 0 / 0.14);
    color: var(--bga-ink);
    backdrop-filter: saturate(180%) blur(24px);
    -webkit-backdrop-filter: saturate(180%) blur(24px);
    animation: bga-pop-in 0.34s var(--bga-ease) backwards;
  }
  .bga-up .bga-nav-pop {
    top: auto;
    bottom: calc(100% - 4px);
    animation-name: bga-pop-in-up;
  }
  .bga-nav-menu {
    left: 16px;
    display: grid;
    gap: 2px;
    min-width: 156px;
    padding: 6px;
    border-radius: 13px;
    transform-origin: 60px 0;
  }
  .bga-up .bga-nav-menu {
    transform-origin: 60px 100%;
  }
  .bga-nav-card {
    right: 16px;
    width: 320px;
    transform-origin: calc(100% - 22px) 0;
  }
  .bga-up .bga-nav-card {
    transform-origin: calc(100% - 22px) 100%;
  }
  .bga-nav-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    height: 38px;
    padding: 0 12px;
    border-radius: 9px;
    white-space: nowrap;
    transition: background 0.18s;
    animation: bga-row-in 0.4s var(--bga-ease) backwards;
  }
  .bga-nav-row:hover {
    background: var(--bga-tile-hover);
  }
  .bga-nav-row svg {
    width: 18px;
    height: 18px;
    color: var(--bga-dim);
    transition:
      color 0.18s,
      transform 0.35s var(--bga-spring);
  }
  .bga-nav-row:hover svg {
    color: var(--bga-pink);
    transform: scale(1.12);
  }
  .bga-nav-note {
    margin-left: auto;
    color: var(--bga-dim);
    font: 11px/1 ui-monospace, "SF Mono", Menlo, monospace;
  }
  .bga-nav-note.bga-hot {
    color: var(--bga-pink);
    font-weight: 700;
  }
  .bga-nav-row:nth-child(1) {
    animation-delay: 0.05s;
  }
  .bga-nav-row:nth-child(2) {
    animation-delay: 0.075s;
  }
  .bga-nav-row:nth-child(3) {
    animation-delay: 0.1s;
  }
  .bga-nav-row:nth-child(4) {
    animation-delay: 0.125s;
  }
  .bga-nav-row:nth-child(5) {
    animation-delay: 0.15s;
  }
  .bga-nav-row:nth-child(6) {
    animation-delay: 0.175s;
  }
  .bga-nav-row:nth-child(n + 7) {
    animation-delay: 0.2s;
  }
  .bga-nav-id {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .bga-nav button.bga-nav-duo {
    cursor: pointer;
    transition: transform 0.35s var(--bga-spring);
  }
  .bga-nav button.bga-nav-duo:hover {
    transform: scale(1.1) rotate(-8deg);
  }
  .bga-nav button.bga-nav-duo:active {
    transform: scale(0.94);
  }
  .bga-nav-head {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 4px 10px;
    .bga-nav-face {
      flex: none;
      width: 56px;
      height: 56px;
    }
  }
  .bga-nav-who {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    b {
      overflow: hidden;
      font-size: 17px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    span {
      overflow: hidden;
      color: var(--bga-dim);
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .bga-nav-duo {
    flex: none;
    width: 22px;
    height: 31px;
    border-radius: 9px;
    background:
      radial-gradient(circle 3.5px at 11px 10.5px, var(--bga-pink) 94%, transparent),
      radial-gradient(circle 3.5px at 11px 20.5px, #fff 94%, transparent),
      #0b0b0c;
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.12);
  }
  .bga-nav-level {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 4px 12px;
    color: var(--bga-dim);
    font: 11px/1 ui-monospace, "SF Mono", Menlo, monospace;
    white-space: nowrap;
  }
  .bga-nav-track {
    flex: 1;
    height: 4px;
    overflow: hidden;
    border-radius: 2px;
    background: var(--bga-tile-hover);
    i {
      display: block;
      height: 100%;
      border-radius: 2px;
      background: var(--bga-pink);
      transform-origin: 0 50%;
      animation: bga-track-in 0.7s 0.12s var(--bga-ease) backwards;
    }
  }
  .bga-nav-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
  .bga-nav-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 9px 0 8px;
    border-radius: 12px;
    background: var(--bga-tile);
    box-shadow: inset 0 0 0 1px var(--bga-line);
    transition: background 0.18s;
    animation: bga-row-in 0.4s var(--bga-ease) backwards;
    b {
      font: 600 18px/1.25 ui-monospace, "SF Mono", Menlo, monospace;
    }
    span {
      color: var(--bga-dim);
      font-size: 11px;
    }
  }
  .bga-nav-stat:hover {
    background: var(--bga-tile-hover);
  }
  .bga-nav-stat:nth-child(2) {
    animation-delay: 0.03s;
  }
  .bga-nav-stat:nth-child(3) {
    animation-delay: 0.06s;
  }
  .bga-nav-list {
    margin-top: 6px;
    overflow: hidden;
    border-radius: 12px;
    background: var(--bga-tile);
    box-shadow: inset 0 0 0 1px var(--bga-line);
    .bga-nav-row {
      height: 42px;
      padding: 0 14px;
      border-radius: 0;
      font-size: 15px;
      font-weight: 500;
    }
    .bga-nav-row svg {
      width: 20px;
      height: 20px;
      color: var(--bga-ink);
    }
    .bga-nav-note a {
      color: inherit;
    }
    .bga-nav-note a:hover {
      color: var(--bga-pink);
    }
  }
  .bga-nav-foot {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-top: 6px;
  }
  .bga-nav button.bga-nav-act {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    height: 38px;
    border-radius: 11px;
    background: var(--bga-tile);
    box-shadow: inset 0 0 0 1px var(--bga-line);
    color: var(--bga-dim);
    font-size: 13px;
    transition:
      background 0.18s,
      color 0.18s,
      transform 0.3s var(--bga-spring);
    animation: bga-row-in 0.4s 0.2s var(--bga-ease) backwards;
    svg {
      width: 17px;
      height: 17px;
    }
  }
  .bga-nav button.bga-nav-act:hover {
    background: var(--bga-tile-hover);
    color: var(--bga-ink);
  }
  .bga-nav button.bga-nav-act:active {
    transform: scale(0.96);
  }
  .bga-nav button.bga-nav-act.bga-hot {
    background: color-mix(in srgb, var(--bga-pink) 18%, var(--bga-tile));
    color: var(--bga-pink);
    font-weight: 600;
  }
  @keyframes bga-pop-in {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.9);
    }
  }
  @keyframes bga-pop-in-up {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.9);
    }
  }
  @keyframes bga-row-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
  }
  @keyframes bga-track-in {
    from {
      transform: scaleX(0);
    }
  }
  @keyframes bga-pop-dot {
    from {
      transform: scale(0);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .bga-nav,
    .bga-nav *,
    .bga-nav *::before,
    .bga-nav *::after {
      transition: none !important;
      animation: none !important;
    }
  }
  .bga-nav-tile {
    position: relative;
    animation: bga-tile-drop 0.55s var(--bga-ease) backwards;
  }
  .bga-nav-search {
    animation-delay: 0.06s;
  }
  .bga-nav-right {
    animation-delay: 0.12s;
  }
  .bga-nav-tile::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(
      120px circle at var(--bga-mx, 50%) var(--bga-my, 50%),
      color-mix(in srgb, var(--bga-pink) 22%, transparent),
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.35s;
    pointer-events: none;
  }
  .bga-nav-tile:hover::before {
    opacity: 1;
  }
  .bga-nav-tile > :not(.bga-nav-pop) {
    position: relative;
  }
  .bga-nav-search::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(100deg, transparent 30%, color-mix(in srgb, var(--bga-pink) 26%, transparent) 50%, transparent 70%);
    background-size: 250% 100%;
    background-position: 120% 0;
    opacity: 0;
    pointer-events: none;
  }
  .bga-nav-search:focus-within::after {
    animation: bga-sweep 0.9s var(--bga-ease);
  }
  .bga-nav-me.bga-in::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(var(--bga-pink), #fff 30%, var(--bga-pink) 60%, transparent 85%, var(--bga-pink));
    mask: radial-gradient(circle, transparent 15px, #000 15.5px);
    -webkit-mask: radial-gradient(circle, transparent 15px, #000 15.5px);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .bga-nav-me.bga-in {
    width: 34px;
    padding: 0;
    border-radius: 50%;
  }
  .bga-nav-me.bga-in:is(:hover, [aria-expanded="true"]) {
    background: none;
  }
  .bga-nav-me.bga-in:is(:hover, [aria-expanded="true"])::before {
    opacity: 1;
    animation: bga-spin 2.4s linear infinite;
  }
  .bga-nav-badge::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: 0 0 0 0 var(--bga-pink);
    animation: bga-ping 1.4s 0.3s ease-out 2;
  }
  .bga-nav button.bga-nav-duo {
    position: relative;
    background: #0b0b0c;
  }
  .bga-nav-duo::before,
  .bga-nav-duo::after {
    content: "";
    position: absolute;
    left: 7.5px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  .bga-nav-duo::before {
    top: 7px;
    background: var(--bga-pink);
    animation: bga-duo-a 0.9s 0.15s var(--bga-spring) backwards;
  }
  .bga-nav-duo::after {
    top: 17px;
    background: #fff;
    animation: bga-duo-b 0.9s 0.15s var(--bga-spring) backwards;
  }
  .bga-nav-row::after {
    content: "";
    flex: none;
    width: 5px;
    height: 5px;
    margin-left: auto;
    border-radius: 50%;
    background: var(--bga-pink);
    transform: scale(0);
    transition: transform 0.32s var(--bga-spring);
  }
  .bga-nav-row:has(.bga-nav-note)::after {
    margin-left: 8px;
  }
  .bga-nav-row:is(:hover, .bga-on)::after {
    transform: none;
  }
  .bga-nav-row.bga-on {
    background: var(--bga-tile-hover);
  }
  button.bga-nav-row {
    width: 100%;
    text-align: left;
  }
  .bga-nav-suggest {
    right: 0;
    left: 0;
    top: calc(100% + 8px);
    display: grid;
    gap: 2px;
    padding: 6px;
    border-radius: 13px;
    transform-origin: 50% 0;
    cursor: default;
  }
  .bga-up .bga-nav-suggest {
    top: auto;
    bottom: calc(100% + 8px);
    transform-origin: 50% 100%;
  }
  .bga-nav-suggest.bga-two {
    grid-template-columns: 1fr 1fr;
    column-gap: 6px;
  }
  .bga-nav-suggest .bga-nav-peek-head {
    grid-column: 1 / -1;
  }
  .bga-nav-rank {
    flex: none;
    width: 18px;
    color: var(--bga-dim);
    font: 700 12px/1 ui-monospace, "SF Mono", Menlo, monospace;
    font-style: normal;
    text-align: center;
  }
  .bga-nav-rank.bga-hot {
    color: var(--bga-pink);
  }
  .bga-nav-label {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .bga-nav-peek {
    right: 16px;
    width: 340px;
    padding: 8px;
    transform-origin: calc(100% - 60px) 0;
  }
  .bga-up .bga-nav-peek {
    transform-origin: calc(100% - 60px) 100%;
  }
  .bga-nav-peek-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 6px 8px 8px;
    font-size: 13px;
    b {
      font-weight: 600;
    }
    a {
      color: var(--bga-dim);
      font-size: 12px;
      transition: color 0.18s;
    }
    a:hover {
      color: var(--bga-pink);
    }
  }
  .bga-nav-peek-body {
    display: grid;
    gap: 2px;
    max-height: min(60vh, 470px);
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .bga-nav-media {
    display: flex;
    gap: 10px;
    padding: 6px;
    border-radius: 10px;
    transition: background 0.18s;
    animation: bga-row-in 0.4s var(--bga-ease) backwards;
  }
  .bga-nav-media:hover {
    background: var(--bga-tile-hover);
  }
  .bga-nav-media:nth-child(2) {
    animation-delay: 0.03s;
  }
  .bga-nav-media:nth-child(3) {
    animation-delay: 0.06s;
  }
  .bga-nav-media:nth-child(4) {
    animation-delay: 0.09s;
  }
  .bga-nav-media:nth-child(n + 5) {
    animation-delay: 0.12s;
  }
  .bga-nav-cover {
    flex: none;
    width: 96px;
    height: 60px;
    border-radius: 7px;
    object-fit: cover;
    background: var(--bga-tile-hover);
    transition: transform 0.4s var(--bga-ease);
  }
  .bga-nav-media:hover .bga-nav-cover {
    transform: scale(1.04);
  }
  .bga-nav-text {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
    b {
      display: -webkit-box;
      overflow: hidden;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.4;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
    span {
      overflow: hidden;
      color: var(--bga-dim);
      font-size: 11px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .bga-nav-ghost {
    height: 60px;
    margin: 6px;
    border-radius: 8px;
    background: linear-gradient(100deg, var(--bga-tile) 30%, var(--bga-tile-hover) 50%, var(--bga-tile) 70%);
    background-size: 250% 100%;
    animation: bga-shimmer 1.2s linear infinite;
  }
  .bga-nav-empty {
    margin: 0;
    padding: 22px 0;
    color: var(--bga-dim);
    font-size: 13px;
    text-align: center;
  }
  @keyframes bga-tile-drop {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.97);
    }
  }
  @keyframes bga-sweep {
    from {
      background-position: 120% 0;
      opacity: 1;
    }
    to {
      background-position: -40% 0;
      opacity: 0;
    }
  }
  @keyframes bga-spin {
    to {
      transform: rotate(1turn);
    }
  }
  @keyframes bga-ping {
    to {
      box-shadow: 0 0 0 7px transparent;
    }
  }
  @keyframes bga-duo-a {
    from {
      transform: translateY(10px);
    }
  }
  @keyframes bga-duo-b {
    from {
      transform: translateY(-10px);
    }
  }
  @keyframes bga-shimmer {
    to {
      background-position: -150% 0;
    }
  }`,
    pages: `:root[data-bga~="page-home"] {
    --layout-padding: var(--bga-gutter);
    .feed-roll-btn {
      inset-inline: auto 0 !important;
      transform: translateX(min(var(--bga-gutter) - 10px, 100% + 10px)) !important;
      .roll-btn {
        aspect-ratio: 1;
      }
      .roll-btn > span {
        display: none;
      }
      .roll-btn > svg {
        margin-block-end: 0 !important;
      }
    }
    .palette-button-wrap {
      inset-inline: auto 18px !important;
    }
    :is(.feed-card, .bili-feed-card, .floor-single-card, .bili-video-card, .load-more-anchor) {
      margin-block-start: 0 !important;
    }
  }
  :root[data-bga~="page-search"] .i_wrapper {
    padding-inline: var(--bga-gutter) !important;
  }
  :root[data-bga~="page-dynamic"] {
    [class^="bili-dyn-home"] {
      justify-content: flex-start;
      margin-inline: var(--bga-gutter);
      main {
        flex: 1;
        min-width: 0;
      }
      aside.right {
        width: auto;
      }
      :is(.bili-dyn-live-users, .bili-dyn-topic-box) {
        transform: none !important;
      }
      .bili-dyn-live-users {
        position: static !important;
        margin-block-end: 10px;
      }
      .bili-dyn-banner {
        display: none;
      }
      .bili-dyn-sidebar {
        right: var(--bga-gutter);
        transform: none;
      }
    }
  }
  :root[data-bga~="page-dynamic"][data-bga~="aside-sticky"] #app aside.left {
    position: sticky;
    top: 72px;
    height: fit-content;
  }
  :root[data-bga~="no-goods"] .bili-dyn-list__item:has(.bili-dyn-card-goods, .bili-rich-text-module.goods) {
    display: none !important;
  }
  :root[data-bga~="page-space"] :is(.space-main, .nav-bar__main, .header-upinfo) {
    --side-padding: var(--bga-gutter) !important;
    max-width: none !important;
  }
  :root[data-bga~="page-opus"] {
    --bga-article: min(100vw - 2 * var(--bga-gutter), 1080px);
    .opus-detail {
      width: var(--bga-article);
      margin-inline: auto;
    }
    .right-sidebar-wrap {
      inset-inline: auto max(8px, (100vw - var(--bga-article)) / 2 - 70px);
      margin-inline-start: 0;
    }
  }
  :root[data-bga~="page-message"] {
    #message-navbar {
      display: none;
    }
    .container {
      width: auto !important;
      max-width: none !important;
    }
    .space-right-top {
      padding-block-start: 0 !important;
    }
  }`,
    panel: `#bga-panel {
    position: fixed;
    inset: 0;
    overflow: hidden;
    width: min(880px, 100vw - 48px);
    height: min(640px, 100vh - 48px);
    margin: auto;
    padding: 0;
    border: 0;
    border-radius: 20px;
    background: var(--bga-bg);
    box-shadow: var(--bga-shadow);
    color: var(--bga-fg);
    font-size: 14px;
    line-height: 1.45;
    text-align: left;
    opacity: 0;
    transform: scale(0.97) translateY(8px);
    transition:
      opacity 0.22s ease,
      transform 0.28s var(--bga-spring),
      overlay 0.22s allow-discrete,
      display 0.22s allow-discrete;
    backdrop-filter: saturate(180%) blur(28px);
    -webkit-backdrop-filter: saturate(180%) blur(28px);
    &:popover-open {
      display: grid;
      grid-template-columns: 204px 1fr;
      opacity: 1;
      transform: none;
    }
    &::backdrop {
      background: rgb(0 0 0 / 0.28);
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
    }
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
    button,
    input,
    select,
    textarea {
      margin: 0;
      outline: none;
      color: inherit;
      font: inherit;
    }
    [hidden] {
      display: none !important;
    }
    * {
      scrollbar-width: thin;
      scrollbar-color: var(--bga-ctl) transparent;
    }
    .bga-side {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
      padding: 18px 10px 12px;
      border-right: 0.5px solid var(--bga-line);
      background: var(--bga-side);
    }
    .bga-brand {
      padding: 2px 10px 14px;
    }
    .bga-brand b {
      display: block;
      font-size: 16px;
      font-weight: 650;
      letter-spacing: -0.01em;
    }
    .bga-brand span {
      color: var(--bga-fg3);
      font-size: 11px;
      font-variant-numeric: tabular-nums;
    }
    .bga-brand a {
      color: inherit;
      text-decoration: none;
      transition: color 0.15s;
    }
    .bga-brand a:hover {
      color: var(--bga-accent);
    }
    .bga-search {
      flex: none;
      height: 30px;
      min-height: 30px;
      margin: 0 0 8px;
      font-size: 13px;
    }
    .bga-tab {
      display: flex;
      gap: 9px;
      align-items: center;
      height: 34px;
      padding: 0 10px;
      border: 0;
      border-radius: 9px;
      background: none;
      color: var(--bga-fg2);
      font-size: 13.5px;
      text-align: left;
      cursor: pointer;
      transition:
        background 0.15s,
        color 0.15s;
    }
    .bga-tab svg {
      flex: none;
      width: 16px;
      height: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.7;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .bga-tab:hover {
      background: var(--bga-ctl);
      color: var(--bga-fg);
    }
    .bga-tab[aria-selected="true"] {
      background: var(--bga-accent);
      color: #fff;
      font-weight: 550;
    }
    .bga-side-foot {
      margin-top: auto;
      padding: 10px 10px 0;
      color: var(--bga-fg3);
      font-size: 11px;
      line-height: 1.5;
    }
    kbd {
      padding: 0 4px;
      border-radius: 4px;
      background: var(--bga-ctl);
      font: inherit;
    }
    .bga-main {
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 0;
    }
    .bga-head {
      display: flex;
      gap: 10px;
      align-items: center;
      padding: 16px 16px 10px 24px;
    }
    .bga-head h2 {
      flex: 1;
      margin: 0;
      color: var(--bga-fg);
      font-size: 20px;
      font-weight: 650;
      letter-spacing: -0.01em;
    }
    .bga-reload {
      display: none;
      gap: 8px;
      align-items: center;
      height: 28px;
      padding: 0 12px;
      border: 0;
      border-radius: 14px;
      background: var(--bga-accent);
      color: #fff;
      font-size: 12.5px;
      font-weight: 550;
      cursor: pointer;
    }
    &[data-dirty] .bga-reload {
      display: inline-flex;
      animation: bga-fade 0.22s ease;
    }
    .bga-close {
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: 50%;
      background: var(--bga-ctl);
      color: var(--bga-fg2);
      cursor: pointer;
      transition:
        background 0.15s,
        transform 0.2s var(--bga-spring);
    }
    .bga-close:hover {
      background: var(--bga-accent);
      color: #fff;
      transform: rotate(90deg);
    }
    .bga-close svg {
      width: 12px;
      height: 12px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
    }
    .bga-body {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
      padding: 4px 24px 24px;
      overscroll-behavior: contain;
    }
    .bga-page {
      display: none;
    }
    .bga-page[data-active] {
      display: block;
      animation: bga-fade 0.22s ease;
    }
    .bga-group {
      margin-top: 18px;
    }
    .bga-group > h3 {
      margin: 0 0 6px 12px;
      color: var(--bga-fg3);
      font-size: 12px;
      font-weight: 550;
      letter-spacing: 0.02em;
    }
    .bga-card {
      overflow: hidden;
      border-radius: 12px;
      background: var(--bga-card);
      box-shadow: 0 0 0 0.5px var(--bga-line);
    }
    .bga-row {
      position: relative;
      display: flex;
      gap: 16px;
      align-items: center;
      min-height: 46px;
      padding: 9px 14px;
    }
    .bga-row + .bga-row::before {
      position: absolute;
      inset: 0 0 auto 14px;
      height: 0.5px;
      background: var(--bga-line);
      content: "";
    }
    .bga-row.bga-col {
      flex-direction: column;
      gap: 8px;
      align-items: stretch;
    }
    .bga-text {
      flex: 1;
      min-width: 0;
    }
    .bga-label {
      color: var(--bga-fg);
      font-size: 14px;
    }
    .bga-hint {
      margin-top: 1px;
      color: var(--bga-fg3);
      font-size: 12px;
    }
    .bga-tag {
      display: inline-block;
      margin-left: 6px;
      color: var(--bga-fg3);
      font-size: 12px;
      line-height: 1;
      cursor: help;
    }
    .bga-empty {
      padding: 22px 14px;
      color: var(--bga-fg3);
      font-size: 13px;
      text-align: center;
    }
    .bga-switch {
      position: relative;
      flex: none;
      width: 42px;
      height: 26px;
      border: 0;
      border-radius: 13px;
      background: var(--bga-ctl);
      cursor: pointer;
      transition: background 0.2s;
      appearance: none;
    }
    .bga-switch::before {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 2px 5px rgb(0 0 0 / 0.22);
      content: "";
      transition: transform 0.24s cubic-bezier(0.3, 1.4, 0.5, 1);
    }
    .bga-switch:checked {
      background: var(--bga-accent);
    }
    .bga-switch:checked::before {
      transform: translateX(16px);
    }
    :is(.bga-switch, .bga-btn, .bga-tab):focus-visible {
      box-shadow: 0 0 0 3px var(--bga-accent-soft);
    }
    .bga-num {
      display: inline-flex;
      flex: none;
      align-items: center;
      overflow: hidden;
      height: 30px;
      border-radius: 8px;
      background: var(--bga-ctl);
    }
    .bga-num input {
      width: 52px;
      height: 100%;
      border: 0;
      background: none;
      font-variant-numeric: tabular-nums;
      text-align: center;
      appearance: textfield;
    }
    .bga-num input::-webkit-inner-spin-button,
    .bga-num input::-webkit-outer-spin-button {
      margin: 0;
      appearance: none;
    }
    .bga-num button {
      width: 28px;
      height: 100%;
      border: 0;
      background: none;
      color: var(--bga-fg2);
      font-size: 16px;
      cursor: pointer;
    }
    .bga-num button:hover {
      background: var(--bga-ctl);
      color: var(--bga-fg);
    }
    .bga-num i {
      padding-right: 8px;
      color: var(--bga-fg3);
      font-size: 12px;
      font-style: normal;
    }
    .bga-seg {
      display: inline-flex;
      flex: none;
      padding: 2px;
      border-radius: 9px;
      background: var(--bga-ctl);
    }
    .bga-seg button {
      height: 26px;
      padding: 0 12px;
      border: 0;
      border-radius: 7px;
      background: none;
      color: var(--bga-fg2);
      font-size: 12.5px;
      cursor: pointer;
      transition:
        background 0.15s,
        color 0.15s;
    }
    .bga-seg button[aria-pressed="true"] {
      background: var(--bga-card);
      box-shadow: 0 1px 3px rgb(0 0 0 / 0.14);
      color: var(--bga-fg);
      font-weight: 550;
    }
    .bga-select {
      flex: none;
      max-width: 220px;
      height: 30px;
      padding: 0 30px 0 12px;
      border: 0;
      border-radius: 9px;
      background:
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='%23888' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 4.5l3 3 3-3'/%3E%3C/svg%3E")
          right 10px center / 12px no-repeat,
        var(--bga-ctl);
      color: var(--bga-fg);
      font: inherit;
      font-size: 12.5px;
      cursor: pointer;
      -webkit-appearance: none;
      appearance: none;
    }
    .bga-select:focus-visible {
      outline: 2px solid var(--bga-accent, #fb7299);
      outline-offset: 1px;
    }
    .bga-input,
    textarea {
      width: 100%;
      min-height: 32px;
      padding: 6px 10px;
      border: 0;
      border-radius: 8px;
      background: var(--bga-ctl);
      font-size: 13px;
    }
    textarea {
      min-height: 58px;
      font-family: var(--bga-mono);
      font-size: 12px;
      resize: vertical;
    }
    :is(.bga-input, textarea):focus,
    .bga-num:focus-within {
      box-shadow: 0 0 0 2px var(--bga-accent);
    }
    .bga-btn {
      flex: none;
      height: 30px;
      padding: 0 14px;
      border: 0;
      border-radius: 8px;
      background: var(--bga-ctl);
      color: var(--bga-fg);
      font-size: 13px;
      white-space: nowrap;
      cursor: pointer;
      transition:
        background 0.15s,
        transform 0.1s;
    }
    .bga-btn:hover {
      background: var(--bga-accent-soft);
      color: var(--bga-accent);
    }
    .bga-btn:active {
      transform: scale(0.97);
    }
    .bga-btn:disabled {
      opacity: 0.5;
      cursor: default;
    }
    .bga-btn.bga-primary {
      background: var(--bga-accent);
      color: #fff;
      font-weight: 550;
    }
    .bga-btn.bga-primary:hover {
      color: #fff;
      filter: brightness(1.06);
    }
    .bga-btn.bga-key {
      min-width: 84px;
      box-shadow: inset 0 -1.5px 0 var(--bga-line);
      font-variant-numeric: tabular-nums;
    }
    .bga-btn.bga-key[data-off] {
      color: var(--bga-fg3);
    }
    .bga-btn.bga-key[data-rec] {
      background: var(--bga-accent);
      box-shadow: 0 0 0 3px var(--bga-accent-soft);
      color: #fff;
    }
    td a,
    .bga-link {
      padding: 0;
      border: 0;
      background: none;
      color: var(--bga-accent);
      font-size: inherit;
      text-decoration: none;
      white-space: nowrap;
      cursor: pointer;
    }
    td a:hover,
    .bga-link:hover {
      text-decoration: underline;
    }
    .bga-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    .bga-bar .bga-input {
      flex: 1;
      width: auto;
      min-width: 120px;
    }
    &[data-q] .bga-page {
      display: block;
      animation: none;
    }
    &[data-q] [data-miss],
    &[data-q] .bga-page > .bga-hint,
    &:not([data-q]) .bga-search-empty {
      display: none !important;
    }
    &[data-q] .bga-tab[aria-selected="true"] {
      background: none;
      color: var(--bga-fg2);
      font-weight: 400;
    }
    .bga-list {
      overflow-y: auto;
      max-height: 300px;
    }
    .bga-user {
      position: relative;
      display: grid;
      grid-template-columns: 32px minmax(90px, 1fr) minmax(120px, 1.4fr) auto;
      gap: 10px;
      align-items: center;
      padding: 8px 14px;
    }
    .bga-user + .bga-user::before {
      position: absolute;
      inset: 0 0 auto 56px;
      height: 0.5px;
      background: var(--bga-line);
      content: "";
    }
    .bga-user img,
    .bga-user .bga-ava {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--bga-ctl);
      object-fit: cover;
    }
    .bga-user a {
      display: block;
      overflow: hidden;
      color: var(--bga-fg);
      font-size: 13px;
      text-decoration: none;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .bga-user a:hover {
      color: var(--bga-accent);
    }
    .bga-user small {
      display: block;
      color: var(--bga-fg3);
      font-size: 11px;
      font-variant-numeric: tabular-nums;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
    }
    th {
      position: sticky;
      top: 0;
      padding: 7px 10px;
      background: var(--bga-card);
      box-shadow: 0 0.5px 0 var(--bga-line);
      color: var(--bga-fg3);
      font-size: 11.5px;
      font-weight: 550;
      text-align: left;
    }
    td {
      padding: 6px 10px;
      border-top: 0.5px solid var(--bga-line);
      font-variant-numeric: tabular-nums;
      vertical-align: top;
    }
    td.bga-dm-text {
      width: 100%;
      font-variant-numeric: normal;
      word-break: break-all;
    }
    .bga-about {
      padding: 14px;
      color: var(--bga-fg2);
      font-size: 12.5px;
      line-height: 1.6;
    }
    .bga-about a {
      color: var(--bga-accent);
      text-decoration: none;
    }
    .bga-about a:hover {
      text-decoration: underline;
    }
  }
  @starting-style {
    #bga-panel:popover-open {
      opacity: 0;
      transform: scale(0.97) translateY(8px);
    }
  }
  @keyframes bga-fade {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
  }
  @media (max-width: 640px) {
    #bga-panel:popover-open {
      grid-template-rows: auto 1fr;
      grid-template-columns: 1fr;
    }
    #bga-panel .bga-side {
      flex-direction: row;
      overflow-x: auto;
      padding: 8px;
      border-right: 0;
      border-bottom: 0.5px solid var(--bga-line);
    }
    #bga-panel :is(.bga-brand, .bga-side-foot) {
      display: none;
    }
    #bga-panel .bga-tab {
      flex: none;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    #bga-panel,
    #bga-panel * {
      transition-duration: 0.01s !important;
      animation: none !important;
    }
  }`,
    player: `:root[data-bga~="video-fit"] #bilibili-player .bpx-player-video-wrap > video {
    object-fit: cover;
  }
  :root[data-bga~="fit-switch"] .bpx-player-ctrl-setting-box :is(.bui-panel-wrap, .bui-panel-item) {
    min-height: var(--bga-setting-height) !important;
  }
  :root[data-bga~="turned"] #bilibili-player .bpx-player-video-wrap > video {
    transform: var(--bga-turn) !important;
  }
  :root[data-bga~="end-no-related"] .bpx-player-ending-related {
    display: none !important;
  }`,
    pod: `:root[data-bga~="pod-open"] .video-pod,
  .bga-pod-fs {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 14px;
    background: color-mix(in srgb, var(--bg1, #fff) 84%, transparent);
    box-shadow:
      0 16px 48px rgb(0 0 0 / 0.38),
      0 0 0 0.5px rgb(128 128 128 / 0.35);
    backdrop-filter: saturate(180%) blur(24px);
    -webkit-backdrop-filter: saturate(180%) blur(24px);
    animation: bga-pod-in 0.24s cubic-bezier(0.2, 0.9, 0.3, 1.1);
  }
  @keyframes bga-pod-in {
    from {
      opacity: 0;
      transform: translateX(18px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    :root[data-bga~="pod-open"] .video-pod,
    .bga-pod-fs {
      animation: none;
    }
  }
  :root[data-bga~="pod-open"] .video-pod,
  .bga-pod-fs {
    .video-pod__header {
      flex: none;
    }
    .video-pod__body {
      flex: 1;
      min-height: 0;
      max-height: none !important;
      overflow-y: auto;
      overscroll-behavior: contain;
    }
    .video-pod__body::-webkit-scrollbar {
      width: 6px;
    }
    .video-pod__body::-webkit-scrollbar-thumb {
      border-radius: 3px;
      background: rgb(128 128 128 / 0.4);
    }
  }
  :root[data-bga~="pod-open"] {
    .right-container-inner {
      z-index: 100002 !important;
    }
    .video-pod {
      position: fixed !important;
      z-index: 100002;
      top: calc(var(--bga-stage-top, 0px) + 12px);
      right: 12px;
      width: min(var(--bga-pod-width, 380px), 100vw - 24px);
      max-height: calc(var(--bga-stage, 100vh) - 84px);
      margin: 0 !important;
    }
  }
  .bga-pod-fs {
    position: absolute;
    z-index: 100;
    top: 12px;
    right: 12px;
    width: min(var(--bga-pod-width, 380px), 100% - 24px);
    max-height: calc(100% - 96px);
    text-align: left;
    > .video-pod {
      position: static !important;
      box-sizing: border-box;
      display: flex;
      flex: 0 1 auto;
      flex-direction: column;
      width: 100%;
      min-height: 0;
      margin: 0 !important;
      background: none !important;
    }
  }
  :root[data-bga~="pod"]:has(.video-pod) .bpx-player-ctrl-eplist-menu-wrap {
    display: none !important;
  }
  .bga-pod-btn {
    width: auto !important;
    padding: 0 6px;
    color: rgb(255 255 255 / 0.9);
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
    white-space: nowrap;
    cursor: pointer;
  }
  .bga-pod-btn:hover {
    color: #fff;
  }
  :root[data-bga~="pod-thumb"] .video-pod .video-pod__body .simple-base-item {
    display: flex !important;
    align-items: center;
    gap: 10px;
    height: auto !important;
    min-height: 62px;
    padding-block: 5px !important;
    &::before {
      content: "";
      flex: none;
      width: 86px;
      aspect-ratio: 16 / 10;
      border-radius: 6px;
      background: var(--bga-thumb, none) center / cover no-repeat rgb(128 128 128 / 0.18);
    }
    .title {
      flex: 1;
      min-width: 0;
      height: auto !important;
    }
    .title-txt {
      display: -webkit-box;
      overflow: hidden;
      line-height: 1.4;
      white-space: normal !important;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
  }`,
    stage: `:root[data-bga~="page-player"] {
    --bga-stage-cap: calc(100vh - min(var(--bga-keep, 0px), 25vh));
    --bga-stage: var(--bga-stage-cap);
    --bga-stage-top: 0px;
    #biliMainHeader {
      position: static;
      height: auto !important;
      min-height: var(--bga-nav);
      margin-block: var(--bga-stage) 0;
      visibility: visible !important;
    }
    .bili-header,
    .bili-header__bar {
      min-width: 0 !important;
      max-width: none !important;
    }
    .bili-header {
      min-height: 0 !important;
    }
    .bili-header__bar {
      position: relative !important;
      height: var(--bga-nav);
    }
    .center-search-container {
      min-width: 0;
    }
    :is(#playerWrap, #bilibili-player-wrap) {
      position: absolute;
      inset: var(--bga-stage-top) 0 auto;
      height: auto;
      min-height: var(--bga-stage);
      padding: 0 !important;
      background: #000;
    }
    :is(.video-container-v1, .left-container, .playlist-container--left, .main-container, .plp-player) {
      position: static !important;
    }
    #bilibili-player-wrap > div {
      position: static !important;
    }
    #bilibili-player {
      width: auto !important;
      height: auto !important;
      box-shadow: none !important;
    }
    #bilibili-player-placeholder {
      display: none;
    }
    .bpx-player-container {
      border-radius: 0;
      box-shadow: none;
    }
    .bpx-player-container[data-screen="web"] {
      z-index: 1 !important;
    }
    .bpx-player-container:not([data-screen="mini"]):not(:fullscreen) .bpx-player-video-wrap > video {
      max-height: var(--bga-stage-cap);
    }
    .bpx-player-container:not([data-screen="mini"]) .bpx-player-video-wrap > video:not([src]) {
      height: var(--bga-stage-cap);
    }
    .bpx-player-video-area > .bpx-player-render-dm-wrap {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .bpx-player-ctrl-wide,
    .bpx-player-ctrl-web {
      display: none;
    }
    .bpx-player-top-left-title,
    .bpx-player-top-left-music,
    .bpx-player-top-mask {
      display: block !important;
    }
    #bilibili-player .bpx-player-video-info {
      width: auto !important;
      margin-inline-end: 10px;
      color: rgb(255 255 255 / 0.9) !important;
    }
    :is(.video-container-v1, .playlist-container, .main-container) {
      box-sizing: border-box;
      width: auto !important;
      max-width: none !important;
      min-width: 0 !important;
      padding-inline: var(--bga-gutter) !important;
    }
    :is(.left-container, .playlist-container--left) {
      flex: 1;
      width: auto;
      min-width: 0;
    }
    .video-info-container,
    #viewbox_report {
      height: auto;
    }
    .video-title {
      white-space: normal !important;
    }
    .plp-left-wrap,
    .plp-r {
      padding-block-start: 0 !important;
    }
    .plp-r {
      position: sticky !important;
    }
  }
  :root[data-bga~="page-player"][data-bga~="stage-pending"]
    .bpx-player-container:not([data-screen="mini"]):not(:fullscreen)
    .bpx-player-video-wrap
    > video {
    height: var(--bga-stage-cap);
  }
  :root[data-bga~="page-player"][data-bga~="dm-docked"] .bpx-player-sending-area {
    display: none;
  }
  :root[data-bga~="page-player"][data-bga~="nav-top"] {
    --bga-stage-top: var(--bga-nav);
    #biliMainHeader {
      position: relative;
      z-index: 100;
      margin-block: 0 var(--bga-stage);
    }
  }
  :root[data-bga~="page-player"][data-bga~="nav-sticky"] #biliMainHeader {
    position: sticky;
    top: 0;
    z-index: 100;
  }
  :root[data-bga~="page-player"][data-bga~="fill-stage"]
    .bpx-player-container:not([data-screen="mini"]):not(:fullscreen)
    .bpx-player-video-wrap
    > video {
    height: var(--bga-stage-cap);
  }
  :root[data-bga~="page-player"][data-bga~="viewers"] .bpx-player-video-info {
    display: flex !important;
  }
  :root[data-bga~="page-player"][data-bga~="compact"] {
    .bpx-player-control-bottom {
      padding-inline: 20px !important;
    }
    .bpx-player-control-bottom-left,
    .bpx-player-control-bottom-right {
      flex: none !important;
      min-width: 0 !important;
      gap: 8px;
    }
    .bpx-player-control-bottom-left > *,
    .bpx-player-control-bottom-right > * {
      flex-shrink: 0 !important;
    }
    .bpx-player-control-bottom-center {
      display: flex;
      flex: 1 1 0 !important;
      justify-content: center;
      min-width: 0 !important;
      padding-inline: 20px !important;
      overflow: hidden;
    }
    .bpx-player-ctrl-btn {
      width: auto !important;
      margin: 0 !important;
    }
    :is(
      .bpx-player-ctrl-prev,
      .bpx-player-ctrl-play,
      .bpx-player-ctrl-next,
      .bpx-player-ctrl-volume,
      .bpx-player-ctrl-setting,
      .bpx-player-ctrl-pip,
      .bpx-player-ctrl-full
    ) {
      flex: 0 0 36px !important;
      width: 36px !important;
    }
    .bpx-player-control-bottom-right > .bpx-player-ctrl-btn:hover {
      padding: 0;
    }
    .bpx-player-ctrl-time {
      width: auto !important;
      min-width: 0 !important;
      margin-inline: 4px !important;
      font-variant-numeric: tabular-nums;
    }
    .bpx-player-ctrl-time-label {
      position: static !important;
      width: auto !important;
      text-indent: 0 !important;
      white-space: nowrap;
    }
    .bpx-player-ctrl-time-seek {
      inset-inline: 0 !important;
      width: auto !important;
      padding-inline: 0 !important;
    }
    .bpx-player-sending-bar {
      flex: 1 1 auto;
      max-width: 90% !important;
      background: none !important;
    }
    .bpx-player-video-inputbar {
      max-width: none !important;
    }
  }
  :root[data-bga~="page-player"] .bpx-player-top-mask {
    transition-property: opacity, visibility !important;
  }
  :root[data-bga~="page-player"][data-bga~="quiet"] .bpx-player-container:not([data-screen="mini"]) {
    .bpx-player-control-wrap:not(:hover) {
      :is(.bpx-player-control-mask, .bpx-player-control-top, .bpx-player-control-bottom, .bpx-player-pbp) {
        opacity: 0 !important;
      }
      .bpx-player-shadow-progress-area {
        visibility: visible !important;
        opacity: 1 !important;
      }
    }
    .bpx-player-control-wrap:hover {
      :is(.bpx-player-control-mask, .bpx-player-control-top, .bpx-player-control-bottom) {
        visibility: visible !important;
        opacity: 1 !important;
      }
    }
    .bpx-player-pbp {
      opacity: 0 !important;
      transition: none !important;
    }
    &:not(.bpx-state-no-cursor) .bpx-player-control-wrap:hover .bpx-player-pbp {
      visibility: visible !important;
      opacity: 1 !important;
      transition: opacity 0.2s ease-in-out !important;
    }
    .bpx-player-top-wrap:hover {
      visibility: visible !important;
      opacity: 1 !important;
    }
  }
  :root[data-bga~="page-player"][data-bga~="pause-controls"]
    .bpx-player-container.bpx-state-paused:not([data-screen="mini"]) {
    :is(.bpx-player-top-wrap, .bpx-player-control-mask, .bpx-player-control-top, .bpx-player-control-bottom) {
      visibility: visible !important;
      opacity: 1 !important;
    }
    .bpx-player-shadow-progress-area {
      visibility: hidden !important;
    }
    .bpx-player-pbp {
      inset: auto 0 100% !important;
      width: auto !important;
      margin-block-end: 5px;
      opacity: 1 !important;
      .bpx-player-pbp-pin {
        opacity: 1 !important;
      }
    }
  }
  :root[data-bga~="page-player"][data-bga~="mini"] {
    .bpx-player-container {
      min-width: 180px;
    }
    .bpx-player-container[data-screen="mini"] {
      inset: auto var(--bga-mini-right, 52px) var(--bga-mini-bottom, 8px) auto !important;
      width: var(--bga-mini-width, 320px) !important;
      height: auto !important;
      .bpx-player-video-wrap > video {
        max-height: calc(100vh - var(--bga-nav) - 16px);
      }
    }
    .bga-mini-grip {
      position: absolute;
      inset: 0 auto 0 0;
      width: 10px;
      cursor: ew-resize;
      touch-action: none;
    }
  }`,
    typography: `:root[data-bga~="font"],
  :root[data-bga~="font"] body {
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "PingFang TC", "Hiragino Sans GB",
      "Helvetica Neue", "Segoe UI", "Microsoft YaHei UI", "Microsoft YaHei", Helvetica, Arial, sans-serif !important;
    -webkit-font-smoothing: antialiased;
  }
  :root[data-bga~="tabular"]
    :is(
      .bpx-player-ctrl-time-label,
      .bpx-player-video-info,
      .bpx-player-ctrl-playbackrate,
      .bili-video-card__stats,
      .bili-video-card__stats--text,
      .video-info-detail,
      .view-text,
      .dm-text,
      .pubdate-ip,
      .bili-dyn-time
    ) {
    font-variant-numeric: tabular-nums;
  }`,
    ui: `.bga-ui {
    color-scheme: light dark;
    --bga-accent: #fb7299;
    --bga-accent-soft: color-mix(in srgb, var(--bga-accent) 14%, transparent);
    --bga-danger: #ff453a;
    --bga-bg: light-dark(rgb(255 255 255 / 0.82), rgb(30 31 34 / 0.82));
    --bga-side: light-dark(rgb(244 245 247 / 0.72), rgb(22 23 26 / 0.72));
    --bga-card: light-dark(rgb(255 255 255 / 0.9), rgb(44 45 49 / 0.9));
    --bga-fg: light-dark(#18191c, #f1f2f3);
    --bga-fg2: light-dark(#61666d, #b4b8bf);
    --bga-fg3: light-dark(#9499a0, #7d828a);
    --bga-line: light-dark(rgb(0 0 0 / 0.08), rgb(255 255 255 / 0.1));
    --bga-ctl: light-dark(rgb(120 120 128 / 0.16), rgb(120 120 128 / 0.32));
    --bga-shadow:
      0 24px 80px light-dark(rgb(0 0 0 / 0.28), rgb(0 0 0 / 0.6)),
      0 0 0 0.5px light-dark(rgb(0 0 0 / 0.12), rgb(255 255 255 / 0.14));
    --bga-font:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang TC", "PingFang SC", "Helvetica Neue", "Segoe UI",
      "Microsoft JhengHei UI", "Microsoft JhengHei", "Microsoft YaHei UI", sans-serif;
    --bga-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    --bga-spring: cubic-bezier(0.2, 0.9, 0.3, 1.15);
    font-family: var(--bga-font);
    -webkit-font-smoothing: antialiased;
  }
  .bga-ui[data-theme="light"] {
    color-scheme: light;
  }
  .bga-ui[data-theme="dark"] {
    color-scheme: dark;
  }
  .bga-ui[data-accent="blue"] {
    --bga-accent: #00aeec;
  }
  .bga-ui[data-accent="graphite"] {
    --bga-accent: #6e6e73;
  }
  .bga-toasts {
    position: fixed;
    z-index: 2147483647;
    top: 76px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
    pointer-events: none;
  }
  .bga-toast {
    display: flex;
    gap: 9px;
    align-items: baseline;
    max-width: 360px;
    padding: 9px 15px 9px 13px;
    border-radius: 13px;
    background: rgb(28 28 30 / 0.84);
    box-shadow:
      0 8px 28px rgb(0 0 0 / 0.28),
      inset 0 0 0 0.5px rgb(255 255 255 / 0.14);
    color: #fff;
    font-size: 13px;
    line-height: 1.4;
    opacity: 0;
    transform: translateX(24px);
    transition:
      opacity 0.25s ease,
      transform 0.35s var(--bga-spring);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
  }
  .bga-toast::before {
    flex: none;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--bga-accent);
    content: "";
    transform: translateY(-1px);
  }
  .bga-toast-ok::before {
    background: #34c759;
  }
  .bga-toast-warn::before {
    background: #ff9f0a;
  }
  .bga-toast.bga-in {
    opacity: 1;
    transform: none;
  }
  #bga-memo-pop {
    position: fixed;
    inset: auto;
    box-sizing: border-box;
    width: 264px;
    margin: 0;
    padding: 12px;
    border: 0;
    border-radius: 14px;
    background: light-dark(rgb(255 255 255 / 0.86), rgb(40 41 45 / 0.88));
    box-shadow:
      0 12px 40px rgb(0 0 0 / 0.28),
      0 0 0 0.5px rgb(128 128 128 / 0.3);
    color: var(--bga-fg);
    font-size: 13px;
    line-height: 1.4;
    text-align: left;
    backdrop-filter: saturate(180%) blur(24px);
    -webkit-backdrop-filter: saturate(180%) blur(24px);
    &:popover-open {
      animation: bga-memo-in 0.18s var(--bga-spring);
    }
    .bga-mp-title {
      display: flex;
      gap: 6px;
      align-items: baseline;
      margin: 0 2px 8px;
      font-weight: 600;
    }
    .bga-mp-title span {
      flex: 1;
      overflow: hidden;
      min-width: 0;
      color: var(--bga-fg3);
      font-size: 12px;
      font-weight: 400;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    input {
      box-sizing: border-box;
      width: 100%;
      height: 32px;
      padding: 0 10px;
      border: 0;
      border-radius: 8px;
      outline: none;
      background: var(--bga-ctl);
      color: inherit;
      font: inherit;
    }
    input:focus {
      box-shadow: 0 0 0 2px var(--bga-accent);
    }
    .bga-mp-btns {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
      margin-top: 10px;
    }
    button {
      height: 28px;
      padding: 0 12px;
      border: 0;
      border-radius: 7px;
      background: var(--bga-ctl);
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    button:hover {
      filter: brightness(0.94);
    }
    .bga-mp-ok {
      background: var(--bga-accent);
      color: #fff;
      font-weight: 550;
    }
    .bga-mp-del {
      margin-right: auto;
      padding: 0 6px;
      background: none;
      color: var(--bga-danger);
    }
  }
  @keyframes bga-memo-in {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(-4px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .bga-toast {
      transition-duration: 0.01s !important;
    }
    #bga-memo-pop:popover-open {
      animation: none;
    }
  }`,
  };

  const I18N = {"zh-Hans":{"比利重啟":"比利重启","空白鍵":"空格键","數字鍵盤 ":"数字键盘 ","首頁":"首页","播放頁":"播放页","動態 · 空間":"动态 · 空间","左右邊距":"左右边距","所有頁面內容區兩側的留白，不會超過視窗寬度的 15%":"所有页面内容区两侧的留白，不会超过窗口宽度的 15%","動態頁":"动态页","側欄吸頂":"侧栏吸顶","側欄內容較長時可能顯示不全":"侧栏内容较长时可能显示不全","隱藏帶貨動態":"隐藏带货动态","播放器撐滿視窗":"播放器撑满视窗","關閉後播放頁回到原本的版面：播放器在左、推薦在右，選集浮層和小窗調整也一併停用":"关闭后播放页回到原本的版面：播放器在左、推荐在右，选集浮层和小窗调整也一并停用","自動高度":"自动高度","播放器跟隨影片比例，上下不留黑邊":"播放器跟随视频比例，上下不留黑边","預留高度":"预留高度","播放器下方露出多少頁面內容；大於 0 時導航欄常駐。不會超過視窗高度的 25%":"播放器下方露出多少页面内容；大于 0 时导航栏常驻。不会超过窗口高度的 25%","導航欄":"导航栏","導航欄放在播放器下方":"导航栏放在播放器下方","導航欄吸頂":"导航栏吸顶","向下捲動時導航欄固定在視窗頂部":"向下滚动时导航栏固定在窗口顶部","控制欄":"控制栏","緊湊控制欄":"紧凑控制栏","按鈕收到圖示大小、間距收緊，省下的寬度都給彈幕輸入框":"按钮收到图标大小、间距收紧，省下的宽度都给弹幕输入框","顯示在看人數 / 彈幕數":"显示在看人数 / 弹幕数","平時隱藏控制欄":"平时隐藏控制栏","滑鼠移到播放器底部才顯示":"鼠标移到播放器底部才显示","暫停時一直顯示控制欄":"暂停时一直显示控制栏","小窗可調整":"小窗可调整","拖小窗左邊緣改寬度，拖小窗本身改位置，並記住":"拖小窗左边缘改宽度，拖小窗本身改位置，并记住","小窗位置與寬度":"小窗位置与宽度","回到右下角、預設寬度":"回到右下角、默认宽度","重設":"重置","小窗已重設":"小窗已重置","使用 Re:Bi 的導航欄":"使用 Re:Bi 的导航栏","整條導航欄換成同一套方磚，每個頁面都一樣；個人卡片從頭像打開。關閉後回到原本的導航欄":"整条导航栏换成同一套方砖，每个页面都一样；个人卡片从头像打开。关闭后回到原本的导航栏","滑過入口時顯示預覽":"滑过入口时显示预览","滑鼠停在消息、動態、收藏、歷史上，直接看到最近的內容":"鼠标停在消息、动态、收藏、历史上，直接看到最近的内容","動態":"动态","歷史":"历史","導航欄右側的入口":"导航栏右侧的入口","番劇":"番剧","熱門":"热门","遊戲中心":"游戏中心","會員購":"会员购","漫畫":"漫画","賽事":"赛事","課堂":"课堂","搜尋影片、UP 主":"搜索影片、UP 主","搜尋":"搜索","登入":"登录","個人卡片":"个人卡片","展開":"展开","切換後會重新載入頁面":"切换后会重新载入页面","淺色":"浅色","登出":"退出登录","再按一次確認":"再按一次确认","稍後再看 {0}":"稍后再看 {0}","硬幣 {0}":"硬币 {0}","B幣 {0}":"B币 {0}","{0} 設定":"{0} 设置","已滿級":"已满级","距 LV{0} 還差 {1}":"距 LV{0} 还差 {1}","關注":"关注","粉絲":"粉丝","個人空間":"个人空间","{0} 則未讀":"{0} 条未读","回覆我的":"回复我的","收到的讚":"收到的赞","系統通知":"系统通知","我的訊息":"我的消息","沒有內容":"没有内容","載入失敗":"载入失败","熱搜":"热搜","選集顯示縮圖":"选集显示缩图","合集顯示每一集的封面，分 P 影片每一段都顯示影片的主封面；捲到哪裡才載入哪裡":"合集显示每一集的封面，分 P 影片每一段都显示影片的主封面；卷到哪里才载入哪里","字體":"字体","使用系統字體":"使用系统字体","Mac 上用蘋方 / San Francisco，Windows 上用微軟雅黑，並開啟字體平滑":"Mac 上用苹方 / San Francisco，Windows 上用微软雅黑，并开启字体平滑","等寬數字":"等宽数字","播放時間、播放量等數字等寬顯示，跳動時不抖動":"播放时间、播放量等数字等宽显示，跳动时不抖动","全螢幕暫停時保留原況文字":"全屏暂停时保留实况文本","開啟後可以在全螢幕暫停的畫面上框選文字，但暫停時右下角的按鈕（選集、小窗、退出全螢幕）會點不動":"开启后可以在全屏暂停的画面上框选文字，但暂停时右下角的按钮（选集、小窗、退出全屏）会点不动","淨化":"净化","頁面":"页面","去掉全站黑白濾鏡":"去掉全站黑白滤镜","隱藏廣告":"隐藏广告","首頁推廣卡片、播放頁右欄的廣告位與推廣卡片、「檢測到廣告攔截」提示":"首页推广卡片、播放页右栏的广告位与推广卡片、“检测到广告拦截”提示","跳過片尾充電名單":"跳过片尾充电名单","頁面載入完成後才清空名單，不一定每次都生效":"页面加载完成后才清空名单，不一定每次都生效","專欄允許複製":"专栏允许复制","片尾不顯示相關推薦":"片尾不显示相关推荐","影片播完後那一排「相關推薦」影片；重播等按鈕還在":"视频播完后那一排“相关推荐”视频；重播等按钮还在","隱私":"隐私","清理網址追蹤參數":"清理网址追踪参数","攔截資料上報":"拦截数据上报","data.bilibili.com / cm.bilibili.com、Sentry、瀏覽器指紋":"data.bilibili.com / cm.bilibili.com、Sentry、浏览器指纹","停用 P2P CDN 與 WebRTC":"停用 P2P CDN 与 WebRTC","不替 B站上傳流量；影片位址換回官方 CDN":"不替 B站上传流量；视频地址换回官方 CDN","播放器設定加入「裁切模式」":"播放器设置加入“裁切模式”","在播放器的齒輪選單裡，讓畫面填滿播放器":"在播放器的齿轮菜单里，让画面填满播放器","每行一個詞；也可以寫 /正則/。B站標題多為簡體字，請用簡體輸入":"每行一个词；也可以写 /正则/。B站标题多为简体字，请用简体输入","標題黨":"标题党","從標題刪掉這些詞":"从标题删掉这些词","影片照常顯示，只把這些詞從標題裡拿掉。{0}":"视频照常显示，只把这些词从标题里拿掉。{0}","標題含有這些詞就隱藏影片":"标题含有这些词就隐藏视频","首頁、推薦、搜尋、排行榜、動態裡整張卡片不顯示；正在看的影片不受影響。{0}":"首页、推荐、搜索、排行榜、动态里整张卡片不显示；正在看的视频不受影响。{0}","收斂誇張標點":"收敛夸张标点","連續的驚嘆號、問號縮成一個（！！！→！）":"连续的感叹号、问号缩成一个（！！！→！）","加入常見的標題黨用詞":"加入常见的标题党用词","把一組常見的誇張用詞加進「從標題刪掉這些詞」，之後可以自己增刪":"把一组常见的夸张用词加进“从标题删掉这些词”，之后可以自己增删","這些詞都已經在清單裡了":"这些词都已经在列表里了","已加入 {0} 個詞":"已加入 {0} 个词","首頁推薦過濾":"首页推荐过滤","播放量低於這個數就隱藏":"播放量低于这个数就隐藏","短於這個長度就隱藏":"短于这个长度就隐藏","長於這個長度就隱藏":"长于这个长度就隐藏","發布超過這麼多天就隱藏":"发布超过这么多天就隐藏","隱藏豎屏影片":"隐藏竖屏视频","要逐個查影片資料，卡片會晚一點才消失":"要逐个查视频数据，卡片会晚一点才消失","已關注的 UP 主不過濾":"已关注的 UP 主不过滤","隱藏這些 UP 主的影片":"隐藏这些 UP 主的视频","每行一個，寫 UP 主名稱或 UID":"每行一个，写 UP 主名称或 UID","封面黨（激進）":"封面党（激进）","替換影片封面":"替换视频封面","不顯示 UP 主上傳的封面，改用影片的第一幀或隨機一幀。每張卡片要多查一次資料，封面會晚一點才換；查得太多可能被 B站暫時限流。封面工具列的保存 / 放大仍是原封面":"不显示 UP 主上传的封面，改用视频的第一帧或随机一帧。每张卡片要多查一次数据，封面会晚一点才换；查得太多可能被 B站暂时限流。封面工具栏的保存 / 放大仍是原封面","關":"关","第一幀":"第一帧","隨機一幀":"随机一帧","影片卡片":"视频卡片","滑鼠移到影片卡片上，封面左上角出現工具列，點「↓」下載原尺寸封面":"鼠标移到视频卡片上，封面左上角出现工具栏，点“↓”下载原尺寸封面","封面懸浮放大":"封面悬浮放大","滑鼠停在工具列的放大鏡上，顯示大圖":"鼠标停在工具栏的放大镜上，显示大图","一鍵拉黑 UP 主":"一键拉黑 UP 主","點工具列的「⊘」直接加入 B站黑名單，再點一次取消；需要已登入":"点工具栏的“⊘”直接加入 B站黑名单，再点一次取消；需要已登录","影片在本頁打開":"视频在本页打开","點影片卡片不再開新分頁；按住 ⌘ / Ctrl 或用中鍵點仍然開新分頁":"点视频卡片不再开新标签页；按住 ⌘ / Ctrl 或用中键点仍然开新标签页","下載失敗":"下载失败","找不到這個影片的封面":"找不到这个视频的封面","封面保存失敗：{0}":"封面保存失败：{0}","錯誤碼 {0}":"错误码 {0}","要先登入 B站才能拉黑":"要先登录 B站才能拉黑","已拉黑「{0}」，再點一次 ⊘ 可取消":"已拉黑“{0}”，再点一次 ⊘ 可取消","已取消拉黑「{0}」":"已取消拉黑“{0}”","拉黑失敗：{0}":"拉黑失败：{0}","首頁主題":"首页主题","主題":"主题","極簡：只有影片列表。大寶鑑：最上面是整幅海報的影片推薦，右下是你關注的更新，往下滑才是影片列表":"极简：只有视频列表。大宝鉴：最上面是整幅海报的视频推荐，右下是你关注的更新，往下滑才是视频列表","極簡":"极简","大寶鑑":"大宝鉴","海報的推薦來源":"海报的推荐来源","綜合熱門":"综合热门","每週必看":"每周必看","我關注的":"我关注的","「我關注的」是你關注的 UP 主最近的投稿，要登入 B站；沒登入時改用綜合熱門":"「我关注的」是你关注的 UP 主最近的投稿，要登录 B站；没登录时改用综合热门","海報上預覽播放":"海报上预览播放","換到一部影片時，海報變成這部影片的畫面，在首頁直接無聲播放；點「播放」才進影片頁。系統開了「減少動態效果」時不播":"换到一部影片时，海报变成这部影片的画面，在首页直接无声播放；点「播放」才进影片页。系统开了「减少动态效果」时不播","預覽有聲音":"预览有声音","瀏覽器規定網頁要先被點過一下才能自己出聲：剛打開首頁時先無聲，點過頁面任何地方之後的預覽就有聲音。海報上的喇叭按鈕可以隨時切換":"浏览器规定网页要先被点过一下才能自己出声：刚打开首页时先无声，点过页面任何地方之后的预览就有声音。海报上的喇叭按钮可以随时切换","滑鼠停在海報上就繼續看":"鼠标停在海报上就继续看","預覽播放中，滑鼠在海報上停一秒半：不再換下一部，換成清楚一點的畫面接著播到結束，播完才換。點畫面在影片頁從同一個時間點接著看":"预览播放中，鼠标在海报上停一秒半：不再换下一部，换成清楚一点的画面接着播到结束，播完才换。点画面在影片页从同一个时间点接着看","右下角放什麼":"右下角放什么","關注的動態要登入 B站，沒登入時改放海報同一來源的其他影片。和海報選同一個來源時，右下接著放海報沒輪到的那些":"关注的动态要登录 B站，没登录时改放海报同一来源的其他影片。和海报选同一个来源时，右下接着放海报没轮到的那些","關注的全部動態":"关注的全部动态","關注的影片":"关注的影片","不顯示":"不显示","海報多久換一張":"海报多久换一张","滑鼠停在播放那一排按鈕上時暫停；系統開了「減少動態效果」就不自動換":"鼠标停在播放那一排按钮上时暂停；系统开了“减弱动态效果”就不自动换","海報畫質":"海报画质","原圖最清楚，每張約 0.2–1 MB；再清楚也不會超過 UP 主上傳的封面":"原图最清楚，每张约 0.2–1 MB；再清楚也不会超过 UP 主上传的封面","原圖":"原图","壓縮":"压缩","海報輪流放幾部影片":"海报轮流放几部视频","影片列表":"视频列表","不顯示左上角那塊大的輪播推薦":"不显示左上角那块大的轮播推荐","不顯示直播、番劇等推薦卡":"不显示直播、番剧等推荐卡","影片列表中間帶「直播」「番劇」「綜藝」這類角標的卡片":"视频列表中间带“直播”“番剧”“综艺”这类角标的卡片","停住就繼續看":"停住就继续看","[按鈕]播放":"播放","{0} 讚":"{0} 赞","稍後再看":"稍后再看","上一部":"上一个","下一部":"下一个","推薦影片":"推荐视频","關閉聲音":"关闭声音","開啟聲音":"开启声音","往後":"往后","來源是空的":"来源是空的","關注更新":"关注更新","更多推薦":"更多推荐","大寶鑑載入失敗：{0}":"大宝鉴加载失败：{0}","動態過濾":"动态过滤","隱藏轉發":"隐藏转发","隱藏直播通知":"隐藏直播通知","隱藏預約（直播 / 影片預約）":"隐藏预约（直播 / 视频预约）","隱藏充電專屬":"隐藏充电专属","隱藏專欄":"隐藏专栏","內容含有這些詞就隱藏":"内容含有这些词就隐藏","每行一個詞；也可以寫 /正則/。比對動態文字、影片標題和被轉發的內容。改動後往下捲載入的新動態開始生效":"每行一个词；也可以写 /正则/。匹配动态文字、视频标题和被转发的内容。改动后往下滚加载的新动态开始生效","加入常見的廣告用詞":"加入常见的广告用词","把一組常見的帶貨、促銷用語加進上面的清單，補足只靠商品卡片認不出來的廣告動態；之後可以自己增刪":"把一组常见的带货、促销用语加进上面的列表，补足只靠商品卡片认不出来的广告动态；之后可以自己增删","評論區":"评论区","備註":"备注","IP 屬地":"IP 属地","評論顯示 IP 屬地":"评论显示 IP 属地","影片、動態、專欄、番劇、直播等頁面的評論與回覆":"视频、动态、专栏、番剧、直播等页面的评论与回复","專欄作者顯示 IP 屬地":"专栏作者显示 IP 属地","屬地文字替換":"属地文字替换","JSON 鍵值對，例如 {\"IP属地：\":\"\"} 可去掉前綴":"JSON 键值对，例如 {\"IP属地：\":\"\"} 可去掉前缀","用戶標記":"用户标记","評論顯示性別":"评论显示性别","資料來自評論介面，未公開性別的用戶不顯示":"数据来自评论接口，未公开性别的用户不显示","屬地文字替換不是合法 JSON，已忽略":"属地文字替换不是合法 JSON，已忽略","性別：{0}":"性别：{0}","顯示":"显示","顯示用戶備註":"显示用户备注","評論區用戶名旁、空間頁，以及頁面上指向該用戶空間首頁的連結":"评论区用户名旁、空间页，以及页面上指向该用户空间首页的链接","顯示方式":"显示方式","暱稱後加標籤":"昵称后加标签","只顯示備註":"只显示备注","輸入備註":"输入备注","備註已儲存":"备注已保存","備註已刪除":"备注已删除","編輯備註":"编辑备注","刪除":"删除","儲存":"保存","點擊修改備註":"点击修改备注","給這位用戶加備註":"给这位用户加备注","備註：{0}":"备注：{0}","＋ 備註":"＋ 备注","評論過濾":"评论过滤","評論區快速拉黑":"评论区快速拉黑","滑鼠移到評論的用戶名那一行，出現「拉黑」；點一下加入 B站黑名單並收起他的評論；誤點的話到 B站的「黑名單」裡移除。需要已登入":"鼠标移到评论的用户名那一行，出现“拉黑”；点一下加入 B站黑名单并收起他的评论；误点的话到 B站的“黑名单”里移除。需要已登录","評論含有這些詞就隱藏":"评论含有这些词就隐藏","留空 = 不啟用。每行一個詞；也可以寫 /正則/。評論和樓中樓回覆都會比對":"留空 = 不启用。每行一个词；也可以写 /正则/。评论和楼中楼回复都会匹配","隱藏帶貨評論":"隐藏带货评论","評論裡帶有商品連結（藍色的購物車連結）就整條收起，常見於 UP 主置頂的工商廣告":"评论里带有商品链接（蓝色的购物车链接）就整条收起，常见于 UP 主置顶的商业推广","已拉黑「{0}」，他的評論已收起":"已拉黑“{0}”，他的评论已收起","加入 B站黑名單":"加入 B站黑名单","畫質":"画质","強制最高畫質（真・原畫）":"强制最高画质（真・原画）","連續載入失敗時會自動退回播放器選擇的畫質":"连续加载失败时会自动退回播放器选择的画质","介面":"界面","網頁全屏 / 全屏時隱藏禮物欄":"网页全屏 / 全屏时隐藏礼物栏","滑鼠移到畫面底部時不再彈出禮物列":"鼠标移到画面底部时不再弹出礼物栏","平時也隱藏禮物欄":"平时也隐藏礼物栏","播放器下方整條禮物 / 包裹列":"播放器下方整条礼物 / 包裹栏","隱藏榜單":"隐藏榜单","聊天區上方的高能榜 / 大航海、標題列的人氣榜、禮物星球等入口":"聊天区上方的高能榜 / 大航海、标题栏的人气榜、礼物星球等入口","隱藏直播區廣告與活動":"隐藏直播区广告与活动","播放器下方的活動輪播、分區頁橫幅、小橙車、活動入口、播放器內的活動浮層":"播放器下方的活动轮播、分区页横幅、小橙车、活动入口、播放器内的活动浮层","隱藏直播間雜項":"隐藏直播间杂项","進場歡迎條、播放器角標":"进场欢迎条、播放器角标","隱藏直播間右側的浮動按鈕":"隐藏直播间右侧的浮动按钮","貼在視窗右邊的「實驗室」「關注」那一條":"贴在视窗右边的「实验室」「关注」那一条","直播畫面鋪滿頁面":"直播画面铺满页面","去掉左右留白：畫面佔滿聊天欄以外的寬度和導航欄以下的高度，主播資訊浮在畫面上（滑鼠移到畫面才顯示），禮物欄往下捲才看得到。不是網頁全螢幕，頁面照常捲動":"去掉左右留白：画面占满聊天栏以外的宽度和导航栏以下的高度，主播信息浮在画面上（鼠标移到画面才显示），礼物栏往下卷才看得到。不是网页全屏，页面照常卷动","彈幕":"弹幕","檢查彈幕是否真的發出":"检查弹幕是否真的发出","B站對被攔截的彈幕也回報「成功」；這裡會提示是系統攔截還是主播屏蔽詞":"B站对被拦截的弹幕也返回“成功”；这里会提示是系统拦截还是主播屏蔽词","被攔截時自動複製內容":"被拦截时自动复制内容","方便修改後重發":"方便修改后重发","發送成功也提示":"发送成功也提示","最高畫質不可用，已退回播放器選擇的畫質":"最高画质不可用，已退回播放器选择的画质","系統攔截（全站敏感詞）":"系统拦截（全站敏感词）","主播 / 房管屏蔽詞":"主播 / 房管屏蔽词","彈幕發送失敗：{0}":"弹幕发送失败：{0}","彈幕已發出":"弹幕已发出","彈幕沒有發出：{0}{1}":"弹幕没有发出：{0}{1}"," · 內容已複製":" · 内容已复制","彈幕查詢":"弹幕查询","這個頁面找不到影片 BV 號":"这个页面找不到视频 BV 号","取得分 P 列表失敗":"获取分 P 列表失败","記住倍速":"记住倍速","換影片、重新整理後沿用上次調的倍速":"换视频、刷新后沿用上次调的倍速","彈幕預設":"弹幕默认","不變":"不变","開":"开","字幕預設":"字幕默认","影片有字幕時才有作用":"视频有字幕时才有作用","快退 / 快進的秒數":"快退 / 快进的秒数","全螢幕時滾輪調音量":"全屏时滚轮调音量","滑鼠在畫面上滾動，每格 5%":"鼠标在画面上滚动，每格 5%","播完自動退出全螢幕":"播完自动退出全屏","後面沒有接著播下一個影片時才退出":"后面没有接着播下一个视频时才退出","截圖同時複製到剪貼簿":"截图同时复制到剪贴板","截圖一律會下載成 PNG；這項再多複製一份":"截图一律会下载成 PNG；这项再多复制一份","響度均衡":"响度均衡","把太大聲的地方壓低、整體音量拉高，各影片聽起來差不多大聲。如果開了以後沒聲音，關掉並重新整理":"把太大声的地方压低、整体音量拉高，各视频听起来差不多大声。如果开了以后没声音，关掉并刷新","選集":"选集","合集播放順序":"合集播放顺序","一集播完後接著播哪一集":"一集播完后接着播哪一集","隨機":"随机","複製連結時去掉追蹤參數":"复制链接时去掉追踪参数","B站「分享 → 複製連結」得到的網址不再帶 vd_source、share_source 等":"B站“分享 → 复制链接”得到的网址不再带 vd_source、share_source 等","影片還沒載入，無法截圖":"视频还没加载，无法截图","無法取得畫面":"无法获取画面","截圖已保存並複製（{0}）":"截图已保存并复制（{0}）","截圖已保存（{0}）":"截图已保存（{0}）","截圖失敗：{0}":"截图失败：{0}","畫面旋轉 {0}°":"画面旋转 {0}°","畫面旋轉：還原":"画面旋转：还原","畫面鏡像：開":"画面镜像：开","畫面鏡像：關":"画面镜像：关","已複製乾淨連結":"已复制干净链接","複製失敗":"复制失败","要先登入 B站才能加入稍後再看":"要先登录 B站才能加入稍后再看","已加入稍後再看":"已加入稍后再看","加入稍後再看失敗：{0}":"加入稍后再看失败：{0}","已通知所有開著的影片分頁":"已通知所有开着的视频标签页","把所有開著的影片分頁加入稍後再看":"把所有开着的视频标签页加入稍后再看","每個開著影片頁的分頁各自把自己加入；需要已登入":"每个开着视频页的标签页各自把自己加入；需要已登录","響度均衡啟用失敗（播放器已經佔用了音訊處理）":"响度均衡启用失败（播放器已经占用了音频处理）","下載":"下载","影片下載":"视频下载","影片頁工具列多一個「下載」，選清晰度後在瀏覽器裡下載並合成 MP4；能下載的清晰度和網頁上能看的一樣":"视频页工具栏多一个「下载」，选清晰度后在浏览器里下载并合成 MP4；能下载的清晰度和网页上能看的一样","優先的編碼":"优先的编码","AVC 幾乎所有播放器都能開；HEVC、AV1 檔案小一些，但舊的裝置可能播不了。影片沒有這種編碼時自動換別的":"AVC 几乎所有播放器都能打开；HEVC、AV1 文件小一些，但旧的设备可能播不了。视频没有这种编码时自动换别的","這部影片沒有可下載的格式":"这个视频没有可下载的格式","下載中斷，請稍後再試":"下载中断，请稍后再试","下載中":"下载中","下載音訊":"下载音频","下載 {0}":"下载 {0}","已交給瀏覽器下載：{0}":"已交给浏览器下载：{0}","已取消下載":"已取消下载","下載失敗：{0}":"下载失败：{0}","讀取清晰度…":"读取清晰度…","{0} 需要大會員":"{0} 需要大会员","登入後可下載更高畫質（{0}）":"登录后可下载更高画质（{0}）","影片很長：檔案會很大，瀏覽器需要足夠的記憶體":"视频很长：文件会很大，浏览器需要足够的内存","只要音訊":"只要音频","讀取失敗：{0}":"读取失败：{0}","下載這部影片":"下载这个视频","開關設定面板":"开关设置面板","選集浮層":"选集浮层","合集 / 分 P 清單，全螢幕下也可以用":"合集 / 分 P 列表，全屏下也可以用","這個影片沒有選集":"这个视频没有选集","畫中畫":"画中画","找不到畫中畫按鈕":"找不到画中画按钮","畫面填滿播放器":"画面填满播放器","裁切模式：開":"裁切模式：开","裁切模式：關":"裁切模式：关","字幕開關":"字幕开关","這個影片沒有字幕":"这个视频没有字幕","播放 / 暫停":"播放 / 暂停","秒數在「播放頁 → 播放」裡設定":"秒数在“播放页 → 播放”里设置","快進":"快进","上一幀":"上一帧","會先暫停":"会先暂停","下一幀":"下一帧","截圖":"截图","以影片原始解析度存成 PNG":"以视频原始分辨率存成 PNG","彈幕開關":"弹幕开关","找不到彈幕開關":"找不到弹幕开关","畫面旋轉 90°":"画面旋转 90°","畫面鏡像":"画面镜像","複製乾淨連結":"复制干净链接","不帶任何追蹤參數的影片網址":"不带任何追踪参数的视频网址","保存目前影片的封面":"保存当前视频的封面","所有開著的影片分頁加入稍後再看":"所有开着的视频标签页加入稍后再看","減速 0.25×":"减速 0.25×","打開彈幕查詢":"打开弹幕查询","網頁全屏":"网页全屏","全螢幕":"全屏","收起 / 展開聊天":"收起 / 展开聊天","網頁全屏或全螢幕時才有作用":"网页全屏或全屏时才有作用","先進入網頁全屏或全螢幕，才能收起聊天":"先进入网页全屏或全屏，才能收起聊天","不是這個腳本匯出的設定檔":"不是这个脚本导出的设置文件","設定面板":"设置面板","還原全部預設值":"还原全部默认值","再按一次確認。備註不會被清除":"再按一次确认。备注不会被清除","所有開關、數值、快捷鍵回到預設；屏蔽詞和備註保留":"所有开关、数值、快捷键回到默认；屏蔽词和备注保留","確認還原":"确认还原","還原":"还原","已還原預設，重新整理後完全生效":"已还原默认，刷新后完全生效","匯出全部設定":"导出全部设置","所有開關、數值、快捷鍵、屏蔽詞和用戶備註存成一個 JSON 檔":"所有开关、数值、快捷键、屏蔽词和用户备注存成一个 JSON 文件","匯出":"导出","匯入設定":"导入设置","讀取「匯出全部設定」存的檔案，覆蓋檔案裡有的項目，其餘不動":"读取“导出全部设置”存的文件，覆盖文件里有的项目，其余不动","選擇檔案":"选择文件","已匯入 {0} 項設定，重新整理後完全生效":"已导入 {0} 项设置，刷新后完全生效","匯入失敗：{0}":"导入失败：{0}","JSON 格式錯誤":"JSON 格式错误","複製診斷資訊":"复制诊断信息","版面出問題時按一下，把複製到的文字貼給開發者。只有版面資訊，不含帳號和你的設定內容":"版面出问题时按一下，把复制到的文字贴给开发者。只有版面信息，不含账号和你的设置内容","複製":"复制","診斷資訊已複製":"诊断信息已复制","外觀":"外观","跟隨系統":"跟随系统","語言":"语言","「自動」會跟隨瀏覽器的語言":"“自动”会跟随浏览器的语言","自動":"自动","強調色":"强调色","B站藍":"B站蓝","快捷鍵":"快捷键","減少":"减少","重新整理頁面後生效":"刷新页面后生效","「{0}」已還原預設":"“{0}”已还原默认","執行":"执行","寬屏版面的構想來自 posthumz 的 ":"宽屏版面的构想来自 posthumz 的 ","，在此致謝。":"，在此致谢。","關於":"关于","搜尋設定":"搜索设置","沒有符合的設定":"没有匹配的设置","搜尋結果":"搜索结果","未設定":"未设置","關閉":"关闭"," 開關面板":" 开关面板","右鍵任一項還原預設":"右键任一项还原默认","重新整理以套用":"刷新以应用","設定":"设置","格式不對":"格式不对","備註清單":"备注列表","搜尋暱稱、備註或 UID":"搜索昵称、备注或 UID","確認刪除":"确认删除","（未知暱稱）":"（未知昵称）","沒有符合的備註":"没有匹配的备注","還沒有備註。在評論區把滑鼠移到用戶名那一行點「備註」，或在空間頁點「＋ 備註」。":"还没有备注。在评论区把鼠标移到用户名那一行点“备注”，或在空间页点“＋ 备注”。","UID 只能是數字":"UID 只能是数字","請輸入備註":"请输入备注","已匯入 {0} 筆備註":"已导入 {0} 条备注","匯入 JSON":"导入 JSON","查詢":"查询","請在影片 / 番劇播放頁打開這一頁。":"请在视频 / 番剧播放页打开这一页。","關鍵字（留空列出全部彈幕）":"关键词（留空列出全部弹幕）","反查全部發送者":"反查全部发送者","UID 超過 11 位（2022 年後註冊的 16 位 UID）無法由彈幕反查":"UID 超过 11 位（2022 年后注册的 16 位 UID）无法由弹幕反查","跳到這個時間":"跳到这个时间","時間":"时间","發送者":"发送者","載入彈幕中…":"加载弹幕中…","，只顯示前 {0} 條（加關鍵字縮小範圍）":"，只显示前 {0} 条（加关键词缩小范围）","共 {0} 條{1}。點時間跳轉，點「反查」取得發送者（結果是 CRC32 對應的最小 UID；16 位新 UID 查不到或可能對應到別人）。":"共 {0} 条{1}。点时间跳转，点“反查”获取发送者（结果是 CRC32 对应的最小 UID；16 位新 UID 查不到或可能对应到别人）。","沒有符合的彈幕":"没有匹配的弹幕","查詢失敗：{0}":"查询失败：{0}","按下按鍵…":"按下按键…","{0} 已經給「{1}」用了":"{0} 已经给“{1}”用了","點按鈕後按下新的按鍵組合。Esc 取消，Delete 停用，右鍵還原預設。打字時單鍵快捷鍵不會觸發；和 B站原有按鍵相同時，以這裡的為準。":"点按钮后按下新的按键组合。Esc 取消，Delete 停用，右键还原默认。打字时单键快捷键不会触发；和 B站原有按键相同时，以这里的为准。","設定已同步，重新整理後完全生效":"设置已同步，刷新后完全生效"},"yue":{"所有頁面內容區兩側的留白，不會超過視窗寬度的 15%":"所有頁面內容區兩邊嘅留白，唔會超過視窗闊度嘅 15%","側欄內容較長時可能顯示不全":"側欄內容太長嗰陣可能顯示唔晒","隱藏帶貨動態":"收埋帶貨動態","關閉後播放頁回到原本的版面：播放器在左、推薦在右，選集浮層和小窗調整也一併停用":"熄咗之後播放頁返返原本嘅版面：播放器喺左、推薦喺右，選集浮層同小窗調整都一齊停用","播放器跟隨影片比例，上下不留黑邊":"播放器跟住影片比例，上下唔留黑邊","播放器下方露出多少頁面內容；大於 0 時導航欄常駐。不會超過視窗高度的 25%":"播放器下面露出幾多頁面內容；大過 0 嗰陣導航欄會長駐。唔會超過視窗高度嘅 25%","導航欄放在播放器下方":"導航欄放喺播放器下面","向下捲動時導航欄固定在視窗頂部":"向下捲嗰陣導航欄固定喺視窗頂","按鈕收到圖示大小、間距收緊，省下的寬度都給彈幕輸入框":"按鈕縮到圖示咁大、間距收窄，慳返嘅闊度全部畀彈幕輸入框","顯示在看人數 / 彈幕數":"顯示睇緊嘅人數 / 彈幕數","平時隱藏控制欄":"平時收埋控制欄","滑鼠移到播放器底部才顯示":"滑鼠移到播放器底部先至顯示","暫停時一直顯示控制欄":"暫停嗰陣一直顯示控制欄","使用 Re:Bi 的導航欄":"用 Re:Bi 嘅導航欄","整條導航欄換成同一套方磚，每個頁面都一樣；個人卡片從頭像打開。關閉後回到原本的導航欄":"成條導航欄換成同一套方磚，每一頁都一樣；個人卡片由頭像打開。熄咗就返返原本嘅導航欄","滑過入口時顯示預覽":"滑過入口嗰陣顯示預覽","滑鼠停在消息、動態、收藏、歷史上，直接看到最近的內容":"滑鼠停喺訊息、動態、收藏、歷史上面，即刻睇到最近嘅內容","消息":"訊息","導航欄右側的入口":"導航欄右邊嘅入口","搜尋影片、UP 主":"搵影片、UP 主","展開":"打開","收起":"收埋","切換後會重新載入頁面":"切換之後會重新載入頁面","再按一次確認":"再撳一次確認","稍後再看 {0}":"稍後再睇 {0}","距 LV{0} 還差 {1}":"距 LV{0} 仲差 {1}","回覆我的":"回覆我嘅","@ 我的":"@ 我嘅","收到的讚":"收到嘅讚","我的訊息":"我嘅訊息","已看完":"睇完","看全部":"睇晒","沒有內容":"冇內容","合集顯示每一集的封面，分 P 影片每一段都顯示影片的主封面；捲到哪裡才載入哪裡":"合集顯示每一集嘅封面，分 P 影片每一段都顯示影片嘅主封面；捲到邊度先載入邊度","播放時間、播放量等數字等寬顯示，跳動時不抖動":"播放時間、播放量呢啲數字等寬顯示，跳動嗰陣唔會震","全螢幕暫停時保留原況文字":"全螢幕暫停嗰陣保留原況文字","開啟後可以在全螢幕暫停的畫面上框選文字，但暫停時右下角的按鈕（選集、小窗、退出全螢幕）會點不動":"開咗之後可以喺全螢幕暫停嘅畫面度框選文字，不過暫停嗰陣右下角嘅按鈕（選集、小窗、退出全螢幕）會撳唔到","隱藏廣告":"收埋廣告","首頁推廣卡片、播放頁右欄的廣告位與推廣卡片、「檢測到廣告攔截」提示":"首頁推廣卡片、播放頁右欄嘅廣告位同推廣卡片、「檢測到廣告攔截」提示","頁面載入完成後才清空名單，不一定每次都生效":"頁面載入完先至清空名單，唔一定次次都生效","片尾不顯示相關推薦":"片尾唔顯示相關推薦","影片播完後那一排「相關推薦」影片；重播等按鈕還在":"影片播完之後嗰一排「相關推薦」影片；重播呢啲按鈕仲喺度","不替 B站上傳流量；影片位址換回官方 CDN":"唔幫 B站上傳流量；影片位址換返官方 CDN","在播放器的齒輪選單裡，讓畫面填滿播放器":"喺播放器嘅齒輪選單入面，令畫面填滿播放器","每行一個詞；也可以寫 /正則/。B站標題多為簡體字，請用簡體輸入":"每行一個詞；都可以寫 /正則/。B站標題多數係簡體字，請用簡體輸入","從標題刪掉這些詞":"喺標題度刪走呢啲詞","影片照常顯示，只把這些詞從標題裡拿掉。{0}":"影片照常顯示，淨係將呢啲詞喺標題度攞走。{0}","標題含有這些詞就隱藏影片":"標題有呢啲詞就收埋影片","首頁、推薦、搜尋、排行榜、動態裡整張卡片不顯示；正在看的影片不受影響。{0}":"首頁、推薦、搜尋、排行榜、動態入面成張卡片唔顯示；睇緊嘅影片唔受影響。{0}","連續的驚嘆號、問號縮成一個（！！！→！）":"連續嘅感嘆號、問號縮成一個（！！！→！）","加入常見的標題黨用詞":"加入常見嘅標題黨用詞","把一組常見的誇張用詞加進「從標題刪掉這些詞」，之後可以自己增刪":"將一組常見嘅誇張用詞加入「喺標題度刪走呢啲詞」，之後可以自己增刪","這些詞都已經在清單裡了":"呢啲詞全部已經喺清單入面喇","播放量低於這個數就隱藏":"播放量少過呢個數就收埋","0 = 不限":"0 = 唔限","短於這個長度就隱藏":"短過呢個長度就收埋","長於這個長度就隱藏":"長過呢個長度就收埋","發布超過這麼多天就隱藏":"發布超過咁多日就收埋","隱藏豎屏影片":"收埋直度影片","要逐個查影片資料，卡片會晚一點才消失":"要逐條查影片資料，卡片會遲啲先至消失","已關注的 UP 主不過濾":"已關注嘅 UP 主唔過濾","隱藏這些 UP 主的影片":"收埋呢啲 UP 主嘅影片","不顯示 UP 主上傳的封面，改用影片的第一幀或隨機一幀。每張卡片要多查一次資料，封面會晚一點才換；查得太多可能被 B站暫時限流。封面工具列的保存 / 放大仍是原封面":"唔顯示 UP 主上傳嘅封面，改用影片嘅第一幀或者隨機一幀。每張卡片要查多一次資料，封面會遲啲先至換；查得太多可能會畀 B站暫時限流。封面工具列嘅保存 / 放大仍然係原本嘅封面","關":"熄","滑鼠停在工具列的放大鏡上，顯示大圖":"滑鼠停喺工具列嘅放大鏡上面，顯示大圖","點工具列的「⊘」直接加入 B站黑名單，再點一次取消；需要已登入":"撳工具列嘅「⊘」直接加入 B站黑名單，再撳一次取消；要先登入","影片在本頁打開":"影片喺本頁打開","點影片卡片不再開新分頁；按住 ⌘ / Ctrl 或用中鍵點仍然開新分頁":"撳影片卡片唔再開新分頁；撳住 ⌘ / Ctrl 或者用中鍵撳就照樣開新分頁","找不到這個影片的封面":"搵唔到呢條影片嘅封面","要先登入 B站才能拉黑":"要先登入 B站先至可以拉黑","找不到 UP 主":"搵唔到 UP 主","極簡：只有影片列表。大寶鑑：最上面是整幅海報的影片推薦，右下是你關注的更新，往下滑才是影片列表":"極簡：淨係得影片列表。大寶鑑：最上面係成幅海報嘅影片推薦，右下係你關注嘅更新，碌落去先至係影片列表","海報的推薦來源":"海報嘅推薦來源","每週必看":"每週必睇","我關注的":"我關注嘅","「我關注的」是你關注的 UP 主最近的投稿，要登入 B站；沒登入時改用綜合熱門":"「我關注嘅」係你關注嘅 UP 主最近嘅投稿，要登入 B站；冇登入就改用綜合熱門","換到一部影片時，海報變成這部影片的畫面，在首頁直接無聲播放；點「播放」才進影片頁。系統開了「減少動態效果」時不播":"換到一部影片嗰陣，海報變成呢部影片嘅畫面，喺首頁直接無聲播放；撳「播放」先入影片頁。系統開咗「減少動態效果」就唔播","預覽有聲音":"預覽有聲","瀏覽器規定網頁要先被點過一下才能自己出聲：剛打開首頁時先無聲，點過頁面任何地方之後的預覽就有聲音。海報上的喇叭按鈕可以隨時切換":"瀏覽器規定網頁要俾人撳過一下先可以自己出聲：啱打開首頁嗰陣先冇聲，撳過頁面任何地方之後嘅預覽就有聲。海報上嘅喇叭掣隨時可以切換","滑鼠停在海報上就繼續看":"滑鼠停喺海報上就繼續睇","預覽播放中，滑鼠在海報上停一秒半：不再換下一部，換成清楚一點的畫面接著播到結束，播完才換。點畫面在影片頁從同一個時間點接著看":"預覽播緊嗰陣，滑鼠喺海報上停一秒半：唔再換下一部，換成清楚啲嘅畫面一路播到完，播完先換。撳畫面就喺影片頁由同一個時間點繼續睇","右下角放什麼":"右下角放咩","關注的動態要登入 B站，沒登入時改放海報同一來源的其他影片。和海報選同一個來源時，右下接著放海報沒輪到的那些":"關注嘅動態要登入 B站，冇登入就改放海報同一來源嘅其他影片。同海報揀同一個來源嘅話，右下就接住放海報冇輪到嘅","關注的全部動態":"關注嘅全部動態","關注的影片":"關注嘅影片","不顯示":"唔顯示","海報多久換一張":"海報幾耐換一張","滑鼠停在播放那一排按鈕上時暫停；系統開了「減少動態效果」就不自動換":"滑鼠停喺播放嗰排掣上面嗰陣暫停；系統開咗「減少動態效果」就唔會自動換","原圖最清楚，每張約 0.2–1 MB；再清楚也不會超過 UP 主上傳的封面":"原圖最清，每張大約 0.2–1 MB；再清都唔會超過 UP 主上傳嘅封面","海報輪流放幾部影片":"海報輪流放幾多部影片","不顯示左上角那塊大的輪播推薦":"唔顯示左上角嗰嚿大嘅輪播推薦","不顯示直播、番劇等推薦卡":"唔顯示直播、番劇呢類推薦卡","影片列表中間帶「直播」「番劇」「綜藝」這類角標的卡片":"影片列表中間帶住「直播」「番劇」「綜藝」呢類角標嘅卡片","停住就繼續看":"停喺度就繼續睇","[按鈕]播放":"播放","稍後再看":"稍後再睇","關閉聲音":"熄聲","開啟聲音":"開聲","來源是空的":"來源係空嘅","隱藏轉發":"收埋轉發","隱藏直播通知":"收埋直播通知","隱藏預約（直播 / 影片預約）":"收埋預約（直播 / 影片預約）","隱藏充電專屬":"收埋充電專屬","隱藏專欄":"收埋專欄","內容含有這些詞就隱藏":"內容有呢啲詞就收埋","每行一個詞；也可以寫 /正則/。比對動態文字、影片標題和被轉發的內容。改動後往下捲載入的新動態開始生效":"每行一個詞；都可以寫 /正則/。會比對動態文字、影片標題同被轉發嘅內容。改完之後，向下捲載入嘅新動態先至開始生效","加入常見的廣告用詞":"加入常見嘅廣告用詞","把一組常見的帶貨、促銷用語加進上面的清單，補足只靠商品卡片認不出來的廣告動態；之後可以自己增刪":"將一組常見嘅帶貨、促銷用語加入上面嘅清單，補返淨係靠商品卡片認唔出嘅廣告動態；之後可以自己增刪","影片、動態、專欄、番劇、直播等頁面的評論與回覆":"影片、動態、專欄、番劇、直播呢啲頁面嘅評論同回覆","資料來自評論介面，未公開性別的用戶不顯示":"資料嚟自評論介面，冇公開性別嘅用戶唔顯示","屬地文字替換不是合法 JSON，已忽略":"屬地文字替換唔係合法 JSON，已經忽略","評論區用戶名旁、空間頁，以及頁面上指向該用戶空間首頁的連結":"評論區用戶名隔籬、空間頁，同埋頁面上面指去呢位用戶空間首頁嘅連結","點擊修改備註":"撳一下改備註","給這位用戶加備註":"幫呢位用戶加備註","滑鼠移到評論的用戶名那一行，出現「拉黑」；點一下加入 B站黑名單並收起他的評論；誤點的話到 B站的「黑名單」裡移除。需要已登入":"滑鼠移到評論嘅用戶名嗰一行，會出現「拉黑」；撳一下就加入 B站黑名單兼收埋佢嘅評論；撳錯嘅話去 B站嘅「黑名單」度移除。要先登入","評論含有這些詞就隱藏":"評論有呢啲詞就收埋","留空 = 不啟用。每行一個詞；也可以寫 /正則/。評論和樓中樓回覆都會比對":"留空 = 唔啟用。每行一個詞；都可以寫 /正則/。評論同樓中樓回覆都會比對","隱藏帶貨評論":"收埋帶貨評論","評論裡帶有商品連結（藍色的購物車連結）就整條收起，常見於 UP 主置頂的工商廣告":"評論入面有商品連結（藍色嘅購物車連結）就成條收埋，常見於 UP 主置頂嘅工商廣告","已拉黑「{0}」，他的評論已收起":"已拉黑「{0}」，佢嘅評論已經收埋","連續載入失敗時會自動退回播放器選擇的畫質":"連續載入失敗嗰陣會自動退返播放器揀嘅畫質","網頁全屏 / 全屏時隱藏禮物欄":"網頁全屏 / 全屏嗰陣收埋禮物欄","滑鼠移到畫面底部時不再彈出禮物列":"滑鼠移到畫面底部嗰陣唔再彈出禮物列","平時也隱藏禮物欄":"平時都收埋禮物欄","播放器下方整條禮物 / 包裹列":"播放器下面成條禮物 / 包裹列","隱藏榜單":"收埋榜單","聊天區上方的高能榜 / 大航海、標題列的人氣榜、禮物星球等入口":"聊天區上面嘅高能榜 / 大航海、標題列嘅人氣榜、禮物星球呢啲入口","隱藏直播區廣告與活動":"收埋直播區廣告同活動","播放器下方的活動輪播、分區頁橫幅、小橙車、活動入口、播放器內的活動浮層":"播放器下面嘅活動輪播、分區頁橫額、小橙車、活動入口、播放器入面嘅活動浮層","隱藏直播間雜項":"收埋直播間雜項","隱藏直播間右側的浮動按鈕":"隱藏直播間右邊嘅浮動掣","貼在視窗右邊的「實驗室」「關注」那一條":"貼喺視窗右邊「實驗室」「關注」嗰條","去掉左右留白：畫面佔滿聊天欄以外的寬度和導航欄以下的高度，主播資訊浮在畫面上（滑鼠移到畫面才顯示），禮物欄往下捲才看得到。不是網頁全螢幕，頁面照常捲動":"去走左右留白：畫面佔滿聊天欄以外嘅闊度同導航欄以下嘅高度，主播資訊浮喺畫面上面（滑鼠移到畫面先顯示），禮物欄要向下捲先見到。唔係網頁全螢幕，頁面照常捲動","檢查彈幕是否真的發出":"檢查彈幕係咪真係發咗出去","B站對被攔截的彈幕也回報「成功」；這裡會提示是系統攔截還是主播屏蔽詞":"B站對畀人攔截嘅彈幕都會回報「成功」；呢度會提示係系統攔截定係主播屏蔽詞","被攔截時自動複製內容":"畀人攔截嗰陣自動複製內容","發送成功也提示":"發送成功都提示","最高畫質不可用，已退回播放器選擇的畫質":"最高畫質用唔到，已經退返播放器揀嘅畫質","彈幕沒有發出：{0}{1}":"彈幕冇發出：{0}{1}","這個頁面找不到影片 BV 號":"呢個頁面搵唔到影片 BV 號","換影片、重新整理後沿用上次調的倍速":"換影片、重新整理之後沿用上次調嘅倍速","不變":"唔變","影片有字幕時才有作用":"影片有字幕嗰陣先至有用","快退 / 快進的秒數":"快退 / 快進嘅秒數","全螢幕時滾輪調音量":"全螢幕嗰陣用滾輪調音量","滑鼠在畫面上滾動，每格 5%":"滑鼠喺畫面上面滾動，每格 5%","後面沒有接著播下一個影片時才退出":"後面冇接住播下一條影片嗰陣先至退出","截圖同時複製到剪貼簿":"截圖同時複製去剪貼簿","截圖一律會下載成 PNG；這項再多複製一份":"截圖一定會下載成 PNG；呢項會再複製多一份","把太大聲的地方壓低、整體音量拉高，各影片聽起來差不多大聲。如果開了以後沒聲音，關掉並重新整理":"將太大聲嘅地方壓低、整體音量拉高，每條影片聽落差唔多大聲。如果開咗之後冇聲，就熄咗佢再重新整理","一集播完後接著播哪一集":"一集播完之後接住播邊一集","複製連結時去掉追蹤參數":"複製連結嗰陣去走追蹤參數","B站「分享 → 複製連結」得到的網址不再帶 vd_source、share_source 等":"B站「分享 → 複製連結」得到嘅網址唔再帶 vd_source、share_source 呢啲","影片還沒載入，無法截圖":"影片仲未載入，截唔到圖","畫面鏡像：關":"畫面鏡像：熄","要先登入 B站才能加入稍後再看":"要先登入 B站先至可以加入稍後再睇","已加入稍後再看":"已加入稍後再睇","加入稍後再看失敗：{0}":"加入稍後再睇失敗：{0}","已通知所有開著的影片分頁":"已經通知所有開住嘅影片分頁","把所有開著的影片分頁加入稍後再看":"將所有開住嘅影片分頁加入稍後再睇","每個開著影片頁的分頁各自把自己加入；需要已登入":"每個開住影片頁嘅分頁各自將自己加入；要先登入","響度均衡啟用失敗（播放器已經佔用了音訊處理）":"響度均衡啟用失敗（播放器已經佔用咗音訊處理）","影片頁工具列多一個「下載」，選清晰度後在瀏覽器裡下載並合成 MP4；能下載的清晰度和網頁上能看的一樣":"影片頁工具列多咗個「下載」，揀咗清晰度就喺瀏覽器度下載並合成 MP4；可以下載嘅清晰度同網頁上睇到嘅一樣","優先的編碼":"優先用嘅編碼","AVC 幾乎所有播放器都能開；HEVC、AV1 檔案小一些，但舊的裝置可能播不了。影片沒有這種編碼時自動換別的":"AVC 差唔多所有播放器都開到；HEVC、AV1 檔案細啲，但舊裝置可能播唔到。影片冇呢種編碼就自動換第二種","這部影片沒有可下載的格式":"呢條片冇可以下載嘅格式","下載中斷，請稍後再試":"下載中斷咗，請遲啲再試","下載中":"下載緊","合成中":"合成緊","已交給瀏覽器下載：{0}":"已經交咗俾瀏覽器下載：{0}","讀取清晰度…":"讀取緊清晰度…","{0} 需要大會員":"{0} 要大會員","登入後可下載更高畫質（{0}）":"登入之後可以下載更高畫質（{0}）","影片很長：檔案會很大，瀏覽器需要足夠的記憶體":"條片好長：檔案會好大，瀏覽器要有足夠記憶體","只要音訊":"淨係要音訊","下載這部影片":"下載呢條片","合集 / 分 P 清單，全螢幕下也可以用":"合集 / 分 P 清單，全螢幕之下都用得","這個影片沒有選集":"呢條影片冇選集","找不到畫中畫按鈕":"搵唔到畫中畫按鈕","裁切模式：關":"裁切模式：熄","這個影片沒有字幕":"呢條影片冇字幕","秒數在「播放頁 → 播放」裡設定":"秒數喺「播放頁 → 播放」度設定","會先暫停":"會暫停先","找不到彈幕開關":"搵唔到彈幕開關","不帶任何追蹤參數的影片網址":"唔帶任何追蹤參數嘅影片網址","保存目前影片的封面":"保存而家呢條影片嘅封面","所有開著的影片分頁加入稍後再看":"所有開住嘅影片分頁加入稍後再睇","網頁全屏或全螢幕時才有作用":"網頁全屏或者全螢幕嗰陣先至有用","先進入網頁全屏或全螢幕，才能收起聊天":"要先入網頁全屏或者全螢幕，先至可以收埋聊天","不是這個腳本匯出的設定檔":"唔係呢個腳本匯出嘅設定檔","再按一次確認。備註不會被清除":"再撳一次確認。備註唔會被清除","所有開關、數值、快捷鍵回到預設；屏蔽詞和備註保留":"所有開關、數值、快捷鍵返去預設；屏蔽詞同備註保留","已還原預設，重新整理後完全生效":"已還原預設，重新整理之後完全生效","所有開關、數值、快捷鍵、屏蔽詞和用戶備註存成一個 JSON 檔":"所有開關、數值、快捷鍵、屏蔽詞同用戶備註存成一個 JSON 檔","讀取「匯出全部設定」存的檔案，覆蓋檔案裡有的項目，其餘不動":"讀取「匯出全部設定」存嘅檔案，冚過檔案入面有嘅項目，其餘唔郁","已匯入 {0} 項設定，重新整理後完全生效":"已匯入 {0} 項設定，重新整理之後完全生效","版面出問題時按一下，把複製到的文字貼給開發者。只有版面資訊，不含帳號和你的設定內容":"版面有問題嗰陣撳一下，將複製到嘅文字貼畀開發者。淨係得版面資訊，冇帳號同你嘅設定內容","「自動」會跟隨瀏覽器的語言":"「自動」會跟瀏覽器嘅語言","重新整理頁面後生效":"重新整理頁面之後生效","寬屏版面的構想來自 posthumz 的 ":"寬屏版面嘅構想嚟自 posthumz 嘅","，在此致謝。":"，喺度多謝。","沒有符合的設定":"搵唔到符合嘅設定","右鍵任一項還原預設":"右鍵撳任何一項還原預設","格式不對":"格式唔啱","沒有符合的備註":"搵唔到符合嘅備註","還沒有備註。在評論區把滑鼠移到用戶名那一行點「備註」，或在空間頁點「＋ 備註」。":"仲未有備註。喺評論區將滑鼠移到用戶名嗰一行撳「備註」，或者喺空間頁撳「＋ 備註」。","UID 只能是數字":"UID 只可以係數字","請在影片 / 番劇播放頁打開這一頁。":"請喺影片 / 番劇播放頁打開呢一頁。","查不到":"查唔到","UID 超過 11 位（2022 年後註冊的 16 位 UID）無法由彈幕反查":"UID 超過 11 位（2022 年之後註冊嘅 16 位 UID）冇辦法由彈幕反查","跳到這個時間":"跳去呢個時間","共 {0} 條{1}。點時間跳轉，點「反查」取得發送者（結果是 CRC32 對應的最小 UID；16 位新 UID 查不到或可能對應到別人）。":"共 {0} 條{1}。撳時間跳轉，撳「反查」攞發送者（結果係 CRC32 對應嘅最細 UID；16 位新 UID 查唔到或者可能對應到第二個人）。","沒有符合的彈幕":"搵唔到符合嘅彈幕","按下按鍵…":"撳掣…","{0} 已經給「{1}」用了":"{0} 已經畀「{1}」用咗","點按鈕後按下新的按鍵組合。Esc 取消，Delete 停用，右鍵還原預設。打字時單鍵快捷鍵不會觸發；和 B站原有按鍵相同時，以這裡的為準。":"撳按鈕之後撳新嘅按鍵組合。Esc 取消，Delete 停用，右鍵還原預設。打字嗰陣單鍵快捷鍵唔會觸發；同 B站原有按鍵一樣嗰陣，以呢度為準。","設定已同步，重新整理後完全生效":"設定已同步，重新整理之後完全生效"},"en":{"比利重啟":"Re:Bi","空白鍵":"Space","數字鍵盤 ":"Numpad","通用":"General","首頁":"Home","播放頁":"Video page","動態 · 空間":"Feed · Space","版面":"Layout","左右邊距":"Side margins","所有頁面內容區兩側的留白，不會超過視窗寬度的 15%":"Blank space on both sides of the content on every page, capped at 15% of the window width","動態頁":"Feed page","側欄吸頂":"Sticky sidebar","側欄內容較長時可能顯示不全":"A long sidebar may be cut off","隱藏帶貨動態":"Hide posts that sell products","播放器":"Player","播放器撐滿視窗":"Player fills the window","關閉後播放頁回到原本的版面：播放器在左、推薦在右，選集浮層和小窗調整也一併停用":"When off, the video page keeps its original layout (player on the left, recommendations on the right); the episode overlay and mini-player adjustments are disabled too","自動高度":"Auto height","播放器跟隨影片比例，上下不留黑邊":"The player follows the video's aspect ratio, with no black bars above or below","預留高度":"Reserved height","播放器下方露出多少頁面內容；大於 0 時導航欄常駐。不會超過視窗高度的 25%":"How much of the page shows below the player. Above 0, the navigation bar stays visible. Capped at 25% of the window height","導航欄":"Navigation bar","導航欄放在播放器下方":"Put the navigation bar below the player","導航欄吸頂":"Sticky navigation bar","向下捲動時導航欄固定在視窗頂部":"The navigation bar stays at the top of the window as you scroll down","控制欄":"Control bar","緊湊控制欄":"Compact control bar","按鈕收到圖示大小、間距收緊，省下的寬度都給彈幕輸入框":"Buttons shrink to icon size with tighter spacing, and the saved width goes to the danmaku input box","顯示在看人數 / 彈幕數":"Show viewer count / danmaku count","平時隱藏控制欄":"Hide the control bar when idle","滑鼠移到播放器底部才顯示":"It appears when the pointer moves to the bottom of the player","暫停時一直顯示控制欄":"Always show the control bar while paused","小窗可調整":"Adjustable mini player","拖小窗左邊緣改寬度，拖小窗本身改位置，並記住":"Drag its left edge to resize and drag the mini player itself to move it. Both are remembered","小窗位置與寬度":"Mini player position and width","回到右下角、預設寬度":"Back to the bottom right corner at the default width","重設":"Reset","小窗已重設":"Mini player reset","使用 Re:Bi 的導航欄":"Use the Re:Bi navigation bar","整條導航欄換成同一套方磚，每個頁面都一樣；個人卡片從頭像打開。關閉後回到原本的導航欄":"Replaces the whole navigation bar with one set of tiles that looks the same on every page; the profile card opens from your avatar. Turn off to get the original bar back","滑過入口時顯示預覽":"Show previews on hover","滑鼠停在消息、動態、收藏、歷史上，直接看到最近的內容":"Hover over Messages, Feed, Favorites or History to see the latest items","消息":"Messages","動態":"Feed","收藏":"Favorites","歷史":"History","導航欄右側的入口":"Entries on the right of the navigation bar","番劇":"Anime","直播":"Live","熱門":"Popular","排行榜":"Rankings","遊戲中心":"Games","會員購":"Shop","漫畫":"Manga","賽事":"Esports","課堂":"Courses","更多":"More","搜尋影片、UP 主":"Search videos and creators","搜尋":"Search","登入":"Log in","個人卡片":"Profile card","展開":"Expand","收起":"Collapse","切換後會重新載入頁面":"The page reloads after switching","深色":"Dark","淺色":"Light","登出":"Log out","再按一次確認":"Click again to confirm","稍後再看 {0}":"Watch later {0}","硬幣 {0}":"{0} coins","B幣 {0}":"{0} B-coins","{0} 設定":"{0} settings","已滿級":"Max level","距 LV{0} 還差 {1}":"{1} to LV{0}","關注":"Following","粉絲":"Followers","個人空間":"My space","{0} 則未讀":"{0} unread","有更新":"New posts","投稿管理":"My uploads","回覆我的":"Replies","@ 我的":"Mentions","收到的讚":"Likes","系統通知":"System notices","我的訊息":"Direct messages","已看完":"Finished","看全部":"See all","沒有內容":"Nothing here","載入失敗":"Failed to load","熱搜":"Trending","選集顯示縮圖":"Thumbnails in the episode list","合集顯示每一集的封面，分 P 影片每一段都顯示影片的主封面；捲到哪裡才載入哪裡":"Collections show the cover of each episode; every part of a multi-part video shows the main cover of the video. Images load only as you scroll to them","字體":"Fonts","使用系統字體":"Use system fonts","Mac 上用蘋方 / San Francisco，Windows 上用微軟雅黑，並開啟字體平滑":"PingFang / San Francisco on Mac, Microsoft YaHei on Windows, with font smoothing turned on","等寬數字":"Tabular numbers","播放時間、播放量等數字等寬顯示，跳動時不抖動":"Numbers such as playback time and view counts use equal widths, so they do not jitter as they change","全螢幕暫停時保留原況文字":"Keep Live Text when paused in full screen","開啟後可以在全螢幕暫停的畫面上框選文字，但暫停時右下角的按鈕（選集、小窗、退出全螢幕）會點不動":"When on, you can select text in the paused full screen picture, but the bottom right buttons (episodes, mini player, exit full screen) cannot be clicked while paused","淨化":"Cleanup","頁面":"Page","去掉全站黑白濾鏡":"Remove the site-wide grayscale filter","隱藏廣告":"Hide ads","首頁推廣卡片、播放頁右欄的廣告位與推廣卡片、「檢測到廣告攔截」提示":"Promoted cards on the home page, ad slots and promoted cards in the right column of the video page, and the \"ad blocker detected\" notice","跳過片尾充電名單":"Skip the supporter list at the end of videos","頁面載入完成後才清空名單，不一定每次都生效":"The list is cleared only after the page finishes loading, so it may not work every time","專欄允許複製":"Allow copying in articles","片尾不顯示相關推薦":"Hide related videos at the end","影片播完後那一排「相關推薦」影片；重播等按鈕還在":"The row of \"related videos\" shown after a video ends. Replay and the other buttons stay","隱私":"Privacy","清理網址追蹤參數":"Remove tracking parameters from URLs","spm_id_from、vd_source、share_* 等":"spm_id_from, vd_source, share_* and so on","攔截資料上報":"Block data reporting","data.bilibili.com / cm.bilibili.com、Sentry、瀏覽器指紋":"data.bilibili.com / cm.bilibili.com, Sentry, browser fingerprinting","播放":"Playback","停用 P2P CDN 與 WebRTC":"Turn off P2P CDN and WebRTC","不替 B站上傳流量；影片位址換回官方 CDN":"Stops uploading traffic for Bilibili. Video addresses switch back to the official CDN","播放器設定加入「裁切模式」":"Add \"Crop mode\" to the player settings","在播放器的齒輪選單裡，讓畫面填滿播放器":"In the player's gear menu. Makes the picture fill the player","裁切模式":"Crop mode","每行一個詞；也可以寫 /正則/。B站標題多為簡體字，請用簡體輸入":"One word per line. /regex/ also works. Most Bilibili titles are in Simplified Chinese, so type in Simplified","標題黨":"Clickbait titles","從標題刪掉這些詞":"Remove these words from titles","影片照常顯示，只把這些詞從標題裡拿掉。{0}":"Videos still show. Only these words are removed from the title. {0}","標題含有這些詞就隱藏影片":"Hide videos whose title contains these words","首頁、推薦、搜尋、排行榜、動態裡整張卡片不顯示；正在看的影片不受影響。{0}":"The whole card is hidden on the home page, recommendations, search, rankings and the feed. The video you are watching is not affected. {0}","收斂誇張標點":"Tone down excessive punctuation","連續的驚嘆號、問號縮成一個（！！！→！）":"Repeated exclamation and question marks shrink to one (！！！→！)","加入常見的標題黨用詞":"Add common clickbait words","把一組常見的誇張用詞加進「從標題刪掉這些詞」，之後可以自己增刪":"Adds a set of common exaggerated words to \"Remove these words from titles\". You can edit the list afterwards","加入":"Add","這些詞都已經在清單裡了":"These words are all in the list already","已加入 {0} 個詞":"Added {0} words","首頁推薦過濾":"Home recommendation filter","播放量低於這個數就隱藏":"Hide videos with fewer views than this","0 = 不限":"0 = no limit","次":"views","短於這個長度就隱藏":"Hide videos shorter than this","秒":"s","長於這個長度就隱藏":"Hide videos longer than this","分":"min","發布超過這麼多天就隱藏":"Hide videos published more than this many days ago","天":"days","隱藏豎屏影片":"Hide vertical videos","要逐個查影片資料，卡片會晚一點才消失":"Each video has to be looked up, so cards disappear a moment later","已關注的 UP 主不過濾":"Do not filter uploaders you follow","隱藏這些 UP 主的影片":"Hide videos from these uploaders","每行一個，寫 UP 主名稱或 UID":"One per line. Enter an uploader name or UID","封面黨（激進）":"Clickbait covers (aggressive)","替換影片封面":"Replace video covers","不顯示 UP 主上傳的封面，改用影片的第一幀或隨機一幀。每張卡片要多查一次資料，封面會晚一點才換；查得太多可能被 B站暫時限流。封面工具列的保存 / 放大仍是原封面":"Hides the cover the uploader chose and uses the first frame or a random frame of the video. Each card needs one more lookup, so covers change a moment later, and too many lookups may get you rate limited by Bilibili for a while. Save / enlarge in the cover toolbar still use the original cover","關":"Off","第一幀":"First frame","隨機一幀":"Random frame","影片卡片":"Video cards","封面快速保存":"Quick cover save","滑鼠移到影片卡片上，封面左上角出現工具列，點「↓」下載原尺寸封面":"Hover over a video card and a toolbar appears at the top left of the cover. Click \"↓\" to download the cover at full size","封面懸浮放大":"Enlarge cover on hover","滑鼠停在工具列的放大鏡上，顯示大圖":"Hover over the magnifier in the toolbar to see the large image","一鍵拉黑 UP 主":"One-click block uploader","點工具列的「⊘」直接加入 B站黑名單，再點一次取消；需要已登入":"Click \"⊘\" in the toolbar to add the uploader to your Bilibili blocklist. Click again to undo. Sign-in required","影片在本頁打開":"Open videos in the same tab","點影片卡片不再開新分頁；按住 ⌘ / Ctrl 或用中鍵點仍然開新分頁":"Clicking a video card no longer opens a new tab. Hold ⌘ / Ctrl or middle-click to open one","下載失敗":"Download failed","找不到這個影片的封面":"Cannot find the cover of this video","封面已保存":"Cover saved","封面保存失敗：{0}":"Could not save the cover: {0}","錯誤碼 {0}":"Error code {0}","保存封面":"Save cover","放大封面":"Enlarge cover","拉黑 UP 主":"Block uploader","要先登入 B站才能拉黑":"Sign in to Bilibili to block","找不到 UP 主":"Cannot find the uploader","已拉黑「{0}」，再點一次 ⊘ 可取消":"Blocked \"{0}\". Click ⊘ again to undo","已取消拉黑「{0}」":"Unblocked \"{0}\"","拉黑失敗：{0}":"Block failed: {0}","首頁主題":"Home theme","主題":"Theme","極簡：只有影片列表。大寶鑑：最上面是整幅海報的影片推薦，右下是你關注的更新，往下滑才是影片列表":"Minimal: only the video list. Showcase: a full-width poster of recommended videos at the top, updates from people you follow at the bottom right, and the video list further down","極簡":"Minimal","大寶鑑":"Showcase","海報的推薦來源":"Poster source","綜合熱門":"Popular","每週必看":"Weekly picks","入站必刷":"All-time classics","我關注的":"Following","「我關注的」是你關注的 UP 主最近的投稿，要登入 B站；沒登入時改用綜合熱門":"\"Following\" shows the latest uploads from creators you follow and needs a Bilibili login; without one it falls back to Popular","海報上預覽播放":"Preview on the poster","換到一部影片時，海報變成這部影片的畫面，在首頁直接無聲播放；點「播放」才進影片頁。系統開了「減少動態效果」時不播":"When the poster moves to a video, it turns into that video playing silently right on the home page; click Play to open the video page. Not played when Reduce Motion is on","預覽有聲音":"Preview with sound","瀏覽器規定網頁要先被點過一下才能自己出聲：剛打開首頁時先無聲，點過頁面任何地方之後的預覽就有聲音。海報上的喇叭按鈕可以隨時切換":"Browsers only let a page play sound after you have clicked it once: right after opening the home page the preview is silent, and after any click it has sound. The speaker button on the poster switches it at any time","滑鼠停在海報上就繼續看":"Keep watching when the pointer rests on the poster","預覽播放中，滑鼠在海報上停一秒半：不再換下一部，換成清楚一點的畫面接著播到結束，播完才換。點畫面在影片頁從同一個時間點接著看":"While a preview plays, rest the pointer on the poster for a second and a half: it stops moving on, switches to a sharper picture and plays to the end before the next one. Click the picture to continue from the same moment on the video page","右下角放什麼":"What goes in the bottom right","關注的動態要登入 B站，沒登入時改放海報同一來源的其他影片。和海報選同一個來源時，右下接著放海報沒輪到的那些":"Followed activity needs a Bilibili login; without one it shows other videos from the poster source. If you pick the same source as the poster, it shows the ones the poster does not cycle through","關注的全部動態":"All activity from people you follow","關注的影片":"Videos from people you follow","不顯示":"Hidden","海報多久換一張":"How often the poster changes","滑鼠停在播放那一排按鈕上時暫停；系統開了「減少動態效果」就不自動換":"Pauses while the pointer is over the row of buttons with Play. Does not change automatically when the system has Reduce Motion on","海報畫質":"Poster quality","原圖最清楚，每張約 0.2–1 MB；再清楚也不會超過 UP 主上傳的封面":"Original is sharpest, about 0.2–1 MB each. It can never be sharper than the cover the uploader provided","原圖":"Original","壓縮":"Compressed","海報輪流放幾部影片":"Number of videos in the poster rotation","最少 4 部，最多 30 部":"From 4 to 30","部":"videos","影片列表":"Video list","不顯示左上角那塊大的輪播推薦":"Hide the large carousel at the top left","不顯示直播、番劇等推薦卡":"Hide live and series recommendation cards","影片列表中間帶「直播」「番劇」「綜藝」這類角標的卡片":"The cards in the video list that carry a badge such as Live, Anime or Variety","{0} 次播放":"{0} views","停住就繼續看":"Hold here to keep watching","[按鈕]播放":"Play","{0} 讚":"{0} likes","稍後再看":"Watch later","上一部":"Previous","下一部":"Next","推薦影片":"Recommended videos","關閉聲音":"Mute","開啟聲音":"Unmute","往前":"Back","往後":"Forward","來源是空的":"The source is empty","關注更新":"From people you follow","更多推薦":"More picks","大寶鑑載入失敗：{0}":"Showcase failed to load: {0}","動態過濾":"Feed filter","隱藏轉發":"Hide reposts","隱藏直播通知":"Hide live notifications","隱藏預約（直播 / 影片預約）":"Hide reservations (live / video)","隱藏充電專屬":"Hide supporter-only posts","隱藏專欄":"Hide articles","內容含有這些詞就隱藏":"Hide posts containing these words","每行一個詞；也可以寫 /正則/。比對動態文字、影片標題和被轉發的內容。改動後往下捲載入的新動態開始生效":"One word per line. /regex/ also works. Matches the post text, video titles and reposted content. Changes apply to posts loaded as you scroll down","加入常見的廣告用詞":"Add common ad words","把一組常見的帶貨、促銷用語加進上面的清單，補足只靠商品卡片認不出來的廣告動態；之後可以自己增刪":"Adds a set of common sales and promotion phrases to the list above, to catch ad posts that the product card alone does not reveal. You can edit the list afterwards","評論區":"Comments","備註":"Notes","IP 屬地":"IP location","評論顯示 IP 屬地":"Show IP location in comments","影片、動態、專欄、番劇、直播等頁面的評論與回覆":"Comments and replies on videos, posts, articles, anime, live and other pages","專欄作者顯示 IP 屬地":"Show IP location of article authors","屬地文字替換":"Location text replacement","JSON 鍵值對，例如 {\"IP属地：\":\"\"} 可去掉前綴":"JSON key-value pairs. For example {\"IP属地：\":\"\"} removes the prefix","用戶標記":"User marks","評論顯示性別":"Show gender in comments","資料來自評論介面，未公開性別的用戶不顯示":"The data comes from the comment API. Users who keep their gender private are not marked","屬地文字替換不是合法 JSON，已忽略":"The location text replacement is not valid JSON and was ignored","性別：{0}":"Gender: {0}","男":"Male","女":"Female","顯示":"Display","顯示用戶備註":"Show user notes","評論區用戶名旁、空間頁，以及頁面上指向該用戶空間首頁的連結":"Next to user names in comments, on space pages, and on links that point to the user's space","顯示方式":"Display style","暱稱後加標籤":"Tag after the name","只顯示備註":"Note only","輸入備註":"Enter a note","備註已儲存":"Note saved","備註已刪除":"Note deleted","編輯備註":"Edit note","刪除":"Delete","取消":"Cancel","儲存":"Save","點擊修改備註":"Click to edit the note","給這位用戶加備註":"Add a note for this user","備註：{0}":"Note: {0}","＋ 備註":"+ Note","評論過濾":"Comment filter","評論區快速拉黑":"Quick block in comments","滑鼠移到評論的用戶名那一行，出現「拉黑」；點一下加入 B站黑名單並收起他的評論；誤點的話到 B站的「黑名單」裡移除。需要已登入":"Hover over the user name line of a comment and \"Block\" appears. One click adds the user to your Bilibili blocklist and collapses their comments. Remove them in Bilibili's blocklist if it was a mistake. Sign-in required","評論含有這些詞就隱藏":"Hide comments containing these words","留空 = 不啟用。每行一個詞；也可以寫 /正則/。評論和樓中樓回覆都會比對":"Empty = off. One word per line. /regex/ also works. Comments and nested replies are both matched","隱藏帶貨評論":"Hide comments that sell products","評論裡帶有商品連結（藍色的購物車連結）就整條收起，常見於 UP 主置頂的工商廣告":"Comments with a product link (the blue shopping cart link) are collapsed entirely. Common in sponsored comments pinned by the uploader","已拉黑「{0}」，他的評論已收起":"Blocked \"{0}\". Their comments are collapsed","加入 B站黑名單":"Add to Bilibili blocklist","拉黑":"Block","畫質":"Quality","直播停用 P2P / 第三方 CDN":"Turn off P2P / third-party CDN for live","強制最高畫質（真・原畫）":"Force the highest quality (true original)","連續載入失敗時會自動退回播放器選擇的畫質":"Falls back to the quality the player chose after repeated loading failures","介面":"Interface","網頁全屏 / 全屏時隱藏禮物欄":"Hide the gift bar in web full screen / full screen","滑鼠移到畫面底部時不再彈出禮物列":"The gift row no longer pops up when the pointer moves to the bottom of the picture","平時也隱藏禮物欄":"Also hide the gift bar normally","播放器下方整條禮物 / 包裹列":"The whole gift / pack row below the player","隱藏榜單":"Hide rankings","聊天區上方的高能榜 / 大航海、標題列的人氣榜、禮物星球等入口":"The top fans / fleet list above the chat, the popularity ranking in the title bar, gift planet and similar entries","隱藏直播區廣告與活動":"Hide ads and events in live","播放器下方的活動輪播、分區頁橫幅、小橙車、活動入口、播放器內的活動浮層":"The event carousel below the player, section banners, the shopping cart, event entries and event overlays in the player","隱藏直播間雜項":"Hide live room extras","進場歡迎條、播放器角標":"Entrance welcome bars and player corner badges","隱藏直播間右側的浮動按鈕":"Hide the floating buttons on the right of live rooms","貼在視窗右邊的「實驗室」「關注」那一條":"The strip on the right edge of the window with Lab and Follow","直播畫面鋪滿頁面":"Live video fills the page","去掉左右留白：畫面佔滿聊天欄以外的寬度和導航欄以下的高度，主播資訊浮在畫面上（滑鼠移到畫面才顯示），禮物欄往下捲才看得到。不是網頁全螢幕，頁面照常捲動":"Removes the side margins: the video takes all the width beside the chat and all the height below the navigation bar; the streamer info floats over the video (shown while the pointer is over it); scroll down for the gift bar. This is not web fullscreen, the page still scrolls","彈幕":"Danmaku","檢查彈幕是否真的發出":"Check whether danmaku were really sent","B站對被攔截的彈幕也回報「成功」；這裡會提示是系統攔截還是主播屏蔽詞":"Bilibili reports \"success\" even for blocked danmaku. This tells you whether the system or the streamer's blocked words stopped it","被攔截時自動複製內容":"Copy the text automatically when blocked","方便修改後重發":"So you can edit it and send again","發送成功也提示":"Also notify on success","最高畫質不可用，已退回播放器選擇的畫質":"The highest quality is not available. Fell back to the quality the player chose","系統攔截（全站敏感詞）":"Blocked by the system (site-wide sensitive words)","主播 / 房管屏蔽詞":"Streamer / moderator blocked words","彈幕發送失敗：{0}":"Danmaku failed to send: {0}","彈幕已發出":"Danmaku sent","彈幕沒有發出：{0}{1}":"Danmaku not sent: {0}{1}"," · 內容已複製":" · Text copied","彈幕查詢":"Danmaku lookup","這個頁面找不到影片 BV 號":"Cannot find a BV number on this page","取得分 P 列表失敗":"Could not get the part list","記住倍速":"Remember playback speed","換影片、重新整理後沿用上次調的倍速":"Keeps the speed you last set across videos and reloads","彈幕預設":"Danmaku default","不變":"Unchanged","開":"On","字幕預設":"Subtitle default","影片有字幕時才有作用":"Only applies when the video has subtitles","快退 / 快進的秒數":"Seconds for rewind / fast forward","全螢幕時滾輪調音量":"Scroll to change volume in full screen","滑鼠在畫面上滾動，每格 5%":"Scroll over the picture, 5% per step","播完自動退出全螢幕":"Exit full screen when playback ends","後面沒有接著播下一個影片時才退出":"Only when no next video follows","截圖同時複製到剪貼簿":"Also copy screenshots to the clipboard","截圖一律會下載成 PNG；這項再多複製一份":"Screenshots are always downloaded as PNG. This copies one as well","響度均衡":"Loudness equalization","把太大聲的地方壓低、整體音量拉高，各影片聽起來差不多大聲。如果開了以後沒聲音，關掉並重新整理":"Lowers the loud parts and raises the overall volume so videos sound about equally loud. If there is no sound after turning it on, turn it off and reload","選集":"Episodes","合集播放順序":"Collection play order","一集播完後接著播哪一集":"Which episode plays after one ends","正常":"Normal","倒序":"Reverse","隨機":"Shuffle","複製連結時去掉追蹤參數":"Remove tracking parameters when copying links","B站「分享 → 複製連結」得到的網址不再帶 vd_source、share_source 等":"URLs from Bilibili's \"Share → Copy link\" no longer carry vd_source, share_source and so on","倍速 {0}×":"Speed {0}×","影片還沒載入，無法截圖":"The video has not loaded yet, so no screenshot can be taken","無法取得畫面":"Cannot get the picture","截圖已保存並複製（{0}）":"Screenshot saved and copied ({0})","截圖已保存（{0}）":"Screenshot saved ({0})","截圖失敗：{0}":"Screenshot failed: {0}","畫面旋轉 {0}°":"Rotated {0}°","畫面旋轉：還原":"Rotation: reset","畫面鏡像：開":"Mirror: on","畫面鏡像：關":"Mirror: off","已複製乾淨連結":"Clean link copied","複製失敗":"Copy failed","要先登入 B站才能加入稍後再看":"Sign in to Bilibili to add to Watch later","已加入稍後再看":"Added to Watch later","加入稍後再看失敗：{0}":"Could not add to Watch later: {0}","已通知所有開著的影片分頁":"All open video tabs have been notified","把所有開著的影片分頁加入稍後再看":"Add all open video tabs to Watch later","每個開著影片頁的分頁各自把自己加入；需要已登入":"Each tab with a video page adds itself. Sign-in required","音量 {0}%":"Volume {0}%","響度均衡啟用失敗（播放器已經佔用了音訊處理）":"Loudness equalization could not start (the player is already using audio processing)","下載":"Download","影片下載":"Video download","影片頁工具列多一個「下載」，選清晰度後在瀏覽器裡下載並合成 MP4；能下載的清晰度和網頁上能看的一樣":"Adds \"Download\" to the video page toolbar: pick a quality and the browser downloads it and merges it into an MP4. The qualities offered are the same ones you can watch on the site","優先的編碼":"Preferred codec","AVC 幾乎所有播放器都能開；HEVC、AV1 檔案小一些，但舊的裝置可能播不了。影片沒有這種編碼時自動換別的":"AVC plays in almost every player; HEVC and AV1 give smaller files but older devices may not play them. If a video doesn't have that codec, another one is used","這部影片沒有可下載的格式":"This video has no downloadable format","下載中斷，請稍後再試":"The download was interrupted. Please try again later","下載中":"Downloading","下載音訊":"Download audio","下載 {0}":"Download {0}","合成中":"Merging","已交給瀏覽器下載：{0}":"Handed to the browser: {0}","已取消下載":"Download cancelled","下載失敗：{0}":"Download failed: {0}","讀取清晰度…":"Loading qualities…","{0} 需要大會員":"{0} needs a Bilibili premium membership","登入後可下載更高畫質（{0}）":"Sign in to download higher qualities ({0})","影片很長：檔案會很大，瀏覽器需要足夠的記憶體":"This video is long: the file will be large and the browser needs enough memory","只要音訊":"Audio only","讀取失敗：{0}":"Couldn't load: {0}","下載這部影片":"Download this video","開關設定面板":"Toggle the settings panel","選集浮層":"Episode overlay","合集 / 分 P 清單，全螢幕下也可以用":"Collection / part list. Also works in full screen","這個影片沒有選集":"This video has no episodes","畫中畫":"Picture in picture","找不到畫中畫按鈕":"Cannot find the picture in picture button","畫面填滿播放器":"The picture fills the player","裁切模式：開":"Crop mode: on","裁切模式：關":"Crop mode: off","字幕開關":"Toggle subtitles","這個影片沒有字幕":"This video has no subtitles","播放 / 暫停":"Play / pause","快退":"Rewind","秒數在「播放頁 → 播放」裡設定":"Set the seconds in \"Video page → Playback\"","快進":"Fast forward","上一幀":"Previous frame","會先暫停":"Pauses first","下一幀":"Next frame","截圖":"Screenshot","以影片原始解析度存成 PNG":"Saved as PNG at the video's original resolution","彈幕開關":"Toggle danmaku","找不到彈幕開關":"Cannot find the danmaku switch","畫面旋轉 90°":"Rotate 90°","畫面鏡像":"Mirror","複製乾淨連結":"Copy clean link","不帶任何追蹤參數的影片網址":"The video URL without any tracking parameters","保存目前影片的封面":"Save the cover of the current video","所有開著的影片分頁加入稍後再看":"Add every open video tab to Watch later","加速 0.25×":"Speed up 0.25×","減速 0.25×":"Slow down 0.25×","回到 1× 倍速":"Back to 1× speed","打開彈幕查詢":"Open danmaku lookup","網頁全屏":"Web full screen","全螢幕":"Full screen","收起 / 展開聊天":"Collapse / expand chat","網頁全屏或全螢幕時才有作用":"Only works in web full screen or full screen","先進入網頁全屏或全螢幕，才能收起聊天":"Enter web full screen or full screen first to collapse the chat","不是這個腳本匯出的設定檔":"This settings file was not exported by this script","設定面板":"Settings panel","還原全部預設值":"Restore all defaults","再按一次確認。備註不會被清除":"Press again to confirm. Notes are not cleared","所有開關、數值、快捷鍵回到預設；屏蔽詞和備註保留":"All switches, values and shortcuts return to their defaults. Blocked words and notes are kept","確認還原":"Confirm restore","還原":"Restore","已還原預設，重新整理後完全生效":"Defaults restored. Reload for full effect","匯出全部設定":"Export all settings","所有開關、數值、快捷鍵、屏蔽詞和用戶備註存成一個 JSON 檔":"Saves all switches, values, shortcuts, blocked words and user notes as one JSON file","匯出":"Export","匯入設定":"Import settings","讀取「匯出全部設定」存的檔案，覆蓋檔案裡有的項目，其餘不動":"Reads a file saved by \"Export all settings\". Items in the file are overwritten and the rest stay as they are","選擇檔案":"Choose file","已匯入 {0} 項設定，重新整理後完全生效":"Imported {0} settings. Reload for full effect","匯入失敗：{0}":"Import failed: {0}","JSON 格式錯誤":"Invalid JSON","複製診斷資訊":"Copy diagnostics","版面出問題時按一下，把複製到的文字貼給開發者。只有版面資訊，不含帳號和你的設定內容":"Press this when the layout looks wrong and paste the copied text to the developer. Layout information only, no account data and none of your settings","複製":"Copy","診斷資訊已複製":"Diagnostics copied","外觀":"Appearance","跟隨系統":"System","語言":"Language","「自動」會跟隨瀏覽器的語言":"\"Auto\" follows your browser language","自動":"Auto","強調色":"Accent color","B站粉":"Bilibili pink","B站藍":"Bilibili blue","石墨":"Graphite","快捷鍵":"Shortcuts","減少":"Decrease","增加":"Increase","重新整理頁面後生效":"Takes effect after reloading the page","「{0}」已還原預設":"\"{0}\" restored to default","執行":"Run","寬屏版面的構想來自 posthumz 的 ":"The widescreen layout is inspired by posthumz's","，在此致謝。":". Thank you.","關於":"About","搜尋設定":"Search settings","沒有符合的設定":"No matching settings","搜尋結果":"Search results","未設定":"Not set","關閉":"Close"," 開關面板":" toggles the panel","右鍵任一項還原預設":"Right-click any item to restore its default","重新整理以套用":"Reload to apply","設定":"Settings","格式不對":"Wrong format","備註清單":"Note list","搜尋暱稱、備註或 UID":"Search name, note or UID","確認刪除":"Confirm delete","（未知暱稱）":"(unknown name)","沒有符合的備註":"No matching notes","還沒有備註。在評論區把滑鼠移到用戶名那一行點「備註」，或在空間頁點「＋ 備註」。":"No notes yet. In comments, hover over the user name line and click \"Note\", or click \"+ Note\" on a space page.","UID 只能是數字":"UID must be digits only","請輸入備註":"Please enter a note","已匯入 {0} 筆備註":"Imported {0} notes","匯入 JSON":"Import JSON","新增":"Add","查詢":"Look up","請在影片 / 番劇播放頁打開這一頁。":"Open this page on a video / anime player page.","關鍵字（留空列出全部彈幕）":"Keyword (leave empty to list all danmaku)","反查全部發送者":"Look up all senders","反查中…":"Looking up…","查不到":"Not found","UID 超過 11 位（2022 年後註冊的 16 位 UID）無法由彈幕反查":"UIDs longer than 11 digits (16-digit UIDs registered after 2022) cannot be looked up from danmaku","反查":"Look up","跳到這個時間":"Jump to this time","時間":"Time","日期":"Date","發送者":"Sender","反查中 {0}/{1}":"Looking up {0}/{1}","載入彈幕中…":"Loading danmaku…","，只顯示前 {0} 條（加關鍵字縮小範圍）":", showing only the first {0} (add a keyword to narrow down)","共 {0} 條{1}。點時間跳轉，點「反查」取得發送者（結果是 CRC32 對應的最小 UID；16 位新 UID 查不到或可能對應到別人）。":"{0} in total{1}. Click a time to jump. Click \"Look up\" to get the sender (the result is the smallest UID matching the CRC32. New 16-digit UIDs cannot be found or may match someone else).","沒有符合的彈幕":"No matching danmaku","查詢失敗：{0}":"Lookup failed: {0}","按下按鍵…":"Press a key…","{0} 已經給「{1}」用了":"{0} is already used by \"{1}\"","點按鈕後按下新的按鍵組合。Esc 取消，Delete 停用，右鍵還原預設。打字時單鍵快捷鍵不會觸發；和 B站原有按鍵相同時，以這裡的為準。":"Click a button, then press the new key combination. Esc cancels, Delete disables, right-click restores the default. Single-key shortcuts do not fire while you type. When a key matches one of Bilibili's own, this one wins.","設定已同步，重新整理後完全生效":"Settings synced. Reload for full effect"},"ja":{"比利重啟":"Re:Bi","空白鍵":"スペース","數字鍵盤 ":"テンキー","通用":"一般","首頁":"ホーム","播放頁":"再生ページ","動態 · 空間":"フィード · スペース","版面":"レイアウト","左右邊距":"左右の余白","所有頁面內容區兩側的留白，不會超過視窗寬度的 15%":"すべてのページでコンテンツの両側に空ける幅。ウインドウ幅の 15% まで","動態頁":"フィードページ","側欄吸頂":"サイドバーを固定","側欄內容較長時可能顯示不全":"サイドバーが長いと全部表示されないことがあります","隱藏帶貨動態":"商品紹介の投稿を隠す","播放器":"プレーヤー","播放器撐滿視窗":"プレーヤーをウィンドウいっぱいに","關閉後播放頁回到原本的版面：播放器在左、推薦在右，選集浮層和小窗調整也一併停用":"オフにすると再生ページは元のレイアウト（左にプレーヤー、右におすすめ）に戻り、エピソード一覧とミニプレーヤーの調整も無効になります","自動高度":"高さを自動調整","播放器跟隨影片比例，上下不留黑邊":"プレーヤーを動画の縦横比に合わせ、上下に黒帯を出しません","預留高度":"下に残す高さ","播放器下方露出多少頁面內容；大於 0 時導航欄常駐。不會超過視窗高度的 25%":"プレーヤーの下にページをどれだけ見せるか。0 より大きいとナビゲーションバーが常に表示されます。ウインドウの高さの 25% まで","導航欄":"ナビゲーションバー","導航欄放在播放器下方":"ナビゲーションバーをプレーヤーの下に置く","導航欄吸頂":"ナビゲーションバーを固定","向下捲動時導航欄固定在視窗頂部":"下にスクロールしてもナビゲーションバーがウインドウの上端に残ります","控制欄":"コントロールバー","緊湊控制欄":"コンパクトなコントロールバー","按鈕收到圖示大小、間距收緊，省下的寬度都給彈幕輸入框":"ボタンをアイコンの大きさにして間隔を詰め、空いた幅を弾幕の入力欄に回します","顯示在看人數 / 彈幕數":"視聴中の人数 / 弾幕数を表示","平時隱藏控制欄":"ふだんはコントロールバーを隠す","滑鼠移到播放器底部才顯示":"ポインタをプレーヤーの下端に動かすと表示されます","暫停時一直顯示控制欄":"一時停止中はコントロールバーを常に表示","小窗可調整":"ミニプレーヤーを調整可能にする","拖小窗左邊緣改寬度，拖小窗本身改位置，並記住":"左端をドラッグで幅を変更、本体をドラッグで移動。どちらも記憶します","小窗位置與寬度":"ミニプレーヤーの位置と幅","回到右下角、預設寬度":"右下、既定の幅に戻します","重設":"リセット","小窗已重設":"ミニプレーヤーをリセットしました","使用 Re:Bi 的導航欄":"Re:Bi のナビゲーションバーを使う","整條導航欄換成同一套方磚，每個頁面都一樣；個人卡片從頭像打開。關閉後回到原本的導航欄":"ナビゲーションバー全体を同じタイルに置き換え、どのページでも同じ見た目にします。プロフィールカードはアイコンから開きます。オフにすると元のバーに戻ります","滑過入口時顯示預覽":"入口にカーソルを載せるとプレビューを表示","滑鼠停在消息、動態、收藏、歷史上，直接看到最近的內容":"メッセージ・動態・お気に入り・履歴にカーソルを載せると最近の内容を表示します","消息":"メッセージ","收藏":"お気に入り","歷史":"履歴","導航欄右側的入口":"ナビゲーションバー右側の入口","番劇":"アニメ","直播":"ライブ","熱門":"人気","排行榜":"ランキング","遊戲中心":"ゲームセンター","會員購":"会員購","漫畫":"マンガ","賽事":"大会","課堂":"講座","更多":"その他","搜尋影片、UP 主":"動画・投稿者を検索","搜尋":"検索","登入":"ログイン","個人卡片":"プロフィールカード","展開":"開く","收起":"たたむ","切換後會重新載入頁面":"切り替えるとページを再読み込みします","深色":"ダーク","淺色":"ライト","登出":"ログアウト","再按一次確認":"もう一度押して確認","稍後再看 {0}":"後で見る {0}","硬幣 {0}":"コイン {0}","B幣 {0}":"Bコイン {0}","已滿級":"最大レベル","距 LV{0} 還差 {1}":"LV{0} まであと {1}","關注":"フォロー","粉絲":"フォロワー","個人空間":"マイスペース","{0} 則未讀":"未読 {0} 件","有更新":"新着あり","回覆我的":"返信","@ 我的":"メンション","收到的讚":"もらったいいね","系統通知":"システム通知","我的訊息":"ダイレクトメッセージ","已看完":"視聴済み","看全部":"すべて見る","沒有內容":"内容がありません","載入失敗":"読み込みに失敗しました","熱搜":"トレンド","選集顯示縮圖":"エピソード一覧にサムネイルを表示","合集顯示每一集的封面，分 P 影片每一段都顯示影片的主封面；捲到哪裡才載入哪裡":"コレクションは各話のカバーを、分割動画はどのパートにも動画のメインカバーを表示します。スクロールした位置の画像だけ読み込みます","字體":"フォント","使用系統字體":"システムフォントを使う","Mac 上用蘋方 / San Francisco，Windows 上用微軟雅黑，並開啟字體平滑":"Mac では PingFang / San Francisco、Windows では Microsoft YaHei を使い、フォントスムージングを有効にします","等寬數字":"等幅数字","播放時間、播放量等數字等寬顯示，跳動時不抖動":"再生時間や再生数などの数字を等幅で表示し、変化してもがたつきません","全螢幕暫停時保留原況文字":"フルスクリーンの一時停止中もテキスト認識を残す","開啟後可以在全螢幕暫停的畫面上框選文字，但暫停時右下角的按鈕（選集、小窗、退出全螢幕）會點不動":"オンにするとフルスクリーンで一時停止した画面の文字を選択できますが、一時停止中は右下のボタン（エピソード、ミニプレーヤー、フルスクリーン解除）が押せなくなります","淨化":"クリーンアップ","頁面":"ページ","去掉全站黑白濾鏡":"サイト全体のモノクロフィルタを外す","隱藏廣告":"広告を隠す","首頁推廣卡片、播放頁右欄的廣告位與推廣卡片、「檢測到廣告攔截」提示":"ホームのプロモーションカード、再生ページ右欄の広告枠とプロモーションカード、「広告ブロックを検出」の通知","跳過片尾充電名單":"動画の最後のサポーター一覧を飛ばす","頁面載入完成後才清空名單，不一定每次都生效":"ページの読み込みが終わってから一覧を消すので、毎回効くとは限りません","專欄允許複製":"記事のコピーを許可","片尾不顯示相關推薦":"動画の最後に関連動画を表示しない","影片播完後那一排「相關推薦」影片；重播等按鈕還在":"再生が終わったあとに並ぶ「関連動画」。リプレイなどのボタンは残ります","隱私":"プライバシー","清理網址追蹤參數":"URL の追跡パラメータを削除","spm_id_from、vd_source、share_* 等":"spm_id_from、vd_source、share_* など","攔截資料上報":"データ送信をブロック","data.bilibili.com / cm.bilibili.com、Sentry、瀏覽器指紋":"data.bilibili.com / cm.bilibili.com、Sentry、ブラウザフィンガープリント","播放":"再生","停用 P2P CDN 與 WebRTC":"P2P CDN と WebRTC を無効にする","不替 B站上傳流量；影片位址換回官方 CDN":"ビリビリのために通信をアップロードしません。動画のアドレスを公式 CDN に戻します","播放器設定加入「裁切模式」":"プレーヤー設定に「クロップモード」を追加","在播放器的齒輪選單裡，讓畫面填滿播放器":"プレーヤーの歯車メニューの中。映像をプレーヤーいっぱいに広げます","裁切模式":"クロップモード","每行一個詞；也可以寫 /正則/。B站標題多為簡體字，請用簡體輸入":"1 行に 1 語。/正規表現/ も使えます。ビリビリのタイトルは簡体字が多いので、簡体字で入力してください","標題黨":"釣りタイトル","從標題刪掉這些詞":"タイトルからこれらの語を消す","影片照常顯示，只把這些詞從標題裡拿掉。{0}":"動画はそのまま表示し、タイトルからこれらの語だけを取り除きます。{0}","標題含有這些詞就隱藏影片":"タイトルにこれらの語がある動画を隠す","首頁、推薦、搜尋、排行榜、動態裡整張卡片不顯示；正在看的影片不受影響。{0}":"ホーム、おすすめ、検索、ランキング、フィードでカードごと表示しません。視聴中の動画には影響しません。{0}","收斂誇張標點":"大げさな記号を抑える","連續的驚嘆號、問號縮成一個（！！！→！）":"連続する感嘆符や疑問符を 1 つにまとめます（！！！→！）","加入常見的標題黨用詞":"よくある釣りタイトルの語を追加","把一組常見的誇張用詞加進「從標題刪掉這些詞」，之後可以自己增刪":"よくある大げさな語をまとめて「タイトルからこれらの語を消す」に追加します。あとで自由に増減できます","加入":"追加","這些詞都已經在清單裡了":"これらの語はすでにリストにあります","已加入 {0} 個詞":"{0} 語を追加しました","首頁推薦過濾":"ホームのおすすめフィルタ","播放量低於這個數就隱藏":"再生数がこの数より少ない動画を隠す","0 = 不限":"0 = 制限なし","次":"回","短於這個長度就隱藏":"この長さより短い動画を隠す","長於這個長度就隱藏":"この長さより長い動画を隠す","發布超過這麼多天就隱藏":"公開からこの日数を過ぎた動画を隠す","天":"日","隱藏豎屏影片":"縦型動画を隠す","要逐個查影片資料，卡片會晚一點才消失":"動画を 1 本ずつ調べるので、カードが消えるまで少し時間がかかります","已關注的 UP 主不過濾":"フォロー中の投稿者は対象外","隱藏這些 UP 主的影片":"これらの投稿者の動画を隠す","每行一個，寫 UP 主名稱或 UID":"1 行に 1 人。投稿者名か UID を書きます","封面黨（激進）":"釣りサムネイル（強力）","替換影片封面":"動画のサムネイルを置き換える","不顯示 UP 主上傳的封面，改用影片的第一幀或隨機一幀。每張卡片要多查一次資料，封面會晚一點才換；查得太多可能被 B站暫時限流。封面工具列的保存 / 放大仍是原封面":"投稿者が設定したサムネイルを表示せず、動画の最初のフレームかランダムなフレームを使います。カードごとに 1 回多く問い合わせるのでサムネイルの切り替えが少し遅れ、問い合わせが多すぎるとビリビリに一時的に制限されることがあります。サムネイルツールバーの保存 / 拡大は元のサムネイルのままです","關":"オフ","第一幀":"最初のフレーム","隨機一幀":"ランダムなフレーム","影片卡片":"動画カード","封面快速保存":"サムネイルをすばやく保存","滑鼠移到影片卡片上，封面左上角出現工具列，點「↓」下載原尺寸封面":"動画カードにポインタを合わせるとサムネイルの左上にツールバーが出ます。「↓」で元のサイズのサムネイルをダウンロードします","封面懸浮放大":"ホバーでサムネイルを拡大","滑鼠停在工具列的放大鏡上，顯示大圖":"ツールバーの虫めがねにポインタを合わせると大きな画像を表示します","一鍵拉黑 UP 主":"ワンクリックで投稿者をブロック","點工具列的「⊘」直接加入 B站黑名單，再點一次取消；需要已登入":"ツールバーの「⊘」でビリビリのブロックリストに追加、もう一度押すと解除。ログインが必要です","影片在本頁打開":"動画を同じタブで開く","點影片卡片不再開新分頁；按住 ⌘ / Ctrl 或用中鍵點仍然開新分頁":"動画カードをクリックしても新しいタブを開きません。⌘ / Ctrl を押しながら、または中クリックなら新しいタブで開きます","下載失敗":"ダウンロードに失敗しました","找不到這個影片的封面":"この動画のサムネイルが見つかりません","封面已保存":"サムネイルを保存しました","封面保存失敗：{0}":"サムネイルを保存できませんでした：{0}","錯誤碼 {0}":"エラーコード {0}","保存封面":"サムネイルを保存","放大封面":"サムネイルを拡大","拉黑 UP 主":"投稿者をブロック","要先登入 B站才能拉黑":"ブロックするにはビリビリにログインしてください","找不到 UP 主":"投稿者が見つかりません","已拉黑「{0}」，再點一次 ⊘ 可取消":"「{0}」をブロックしました。もう一度 ⊘ を押すと解除できます","已取消拉黑「{0}」":"「{0}」のブロックを解除しました","拉黑失敗：{0}":"ブロックに失敗しました：{0}","首頁主題":"ホームのテーマ","主題":"テーマ","極簡：只有影片列表。大寶鑑：最上面是整幅海報的影片推薦，右下是你關注的更新，往下滑才是影片列表":"ミニマル：動画リストだけ。ショーケース：いちばん上に画面いっぱいのおすすめ動画ポスター、右下にフォロー中の更新、下にスクロールすると動画リスト","極簡":"ミニマル","大寶鑑":"ショーケース","海報的推薦來源":"ポスターのおすすめ元","綜合熱門":"総合人気","每週必看":"毎週の必見","入站必刷":"殿堂入り","我關注的":"フォロー中","「我關注的」是你關注的 UP 主最近的投稿，要登入 B站；沒登入時改用綜合熱門":"「フォロー中」はフォローしている投稿者の最新動画です。ビリビリへのログインが必要で、未ログイン時は総合人気を使います","海報上預覽播放":"ポスターでプレビュー再生","換到一部影片時，海報變成這部影片的畫面，在首頁直接無聲播放；點「播放」才進影片頁。系統開了「減少動態效果」時不播":"ポスターが次の動画に切り替わると、その動画の映像をホームでそのまま無音再生します。「再生」を押すと動画ページを開きます。「視差効果を減らす」がオンのときは再生しません","預覽有聲音":"プレビューに音を付ける","瀏覽器規定網頁要先被點過一下才能自己出聲：剛打開首頁時先無聲，點過頁面任何地方之後的預覽就有聲音。海報上的喇叭按鈕可以隨時切換":"ブラウザーはページが一度クリックされるまで音を出させません。ホームを開いた直後は無音で、どこかをクリックした後のプレビューから音が出ます。ポスター上のスピーカーボタンでいつでも切り替えられます","滑鼠停在海報上就繼續看":"ポスターにカーソルを置くと続けて見る","預覽播放中，滑鼠在海報上停一秒半：不再換下一部，換成清楚一點的畫面接著播到結束，播完才換。點畫面在影片頁從同一個時間點接著看":"プレビュー再生中にポスターの上で1.5秒カーソルを止めると、次に進まず、より鮮明な映像に切り替えて最後まで再生し、終わってから次へ進みます。映像をクリックすると動画ページの同じ位置から続きを見られます","右下角放什麼":"右下に表示するもの","關注的動態要登入 B站，沒登入時改放海報同一來源的其他影片。和海報選同一個來源時，右下接著放海報沒輪到的那些":"フォローの動態はビリビリへのログインが必要で、未ログイン時はポスターと同じ提供元の他の動画を表示します。ポスターと同じ提供元を選ぶと、ポスターで回らない残りの動画を表示します","關注的全部動態":"フォローの全動態","關注的影片":"フォローの動画","不顯示":"表示しない","海報多久換一張":"ポスターを切り替える間隔","滑鼠停在播放那一排按鈕上時暫停；系統開了「減少動態效果」就不自動換":"ポインタが再生ボタンの並びの上にある間は止まります。システムの「視差効果を減らす」がオンのときは自動で切り替わりません","海報畫質":"ポスターの画質","原圖最清楚，每張約 0.2–1 MB；再清楚也不會超過 UP 主上傳的封面":"オリジナルが最も鮮明で、1 枚あたり約 0.2〜1 MB。投稿者がアップロードしたカバー以上には鮮明になりません","原圖":"オリジナル","壓縮":"圧縮","海報輪流放幾部影片":"ポスターで順に表示する動画の数","最少 4 部，最多 30 部":"4〜30 本","部":"本","影片列表":"動画リスト","不顯示左上角那塊大的輪播推薦":"左上の大きなカルーセルを表示しない","不顯示直播、番劇等推薦卡":"ライブ・アニメなどのおすすめカードを表示しない","影片列表中間帶「直播」「番劇」「綜藝」這類角標的卡片":"動画リストの途中にある「ライブ」「アニメ」「バラエティ」などのバッジ付きカード","{0} 次播放":"{0} 回再生","停住就繼續看":"止めると続けて見る","[按鈕]播放":"再生","{0} 讚":"{0} いいね","稍後再看":"あとで見る","上一部":"前へ","下一部":"次へ","推薦影片":"おすすめ動画","關閉聲音":"消音","開啟聲音":"音を出す","往前":"戻る","往後":"進む","來源是空的":"おすすめ元が空です","關注更新":"フォロー中の更新","更多推薦":"ほかのおすすめ","大寶鑑載入失敗：{0}":"ショーケースを読み込めませんでした：{0}","動態過濾":"フィードフィルタ","隱藏轉發":"リポストを隠す","隱藏直播通知":"ライブ通知を隠す","隱藏預約（直播 / 影片預約）":"予約（ライブ / 動画の予約）を隠す","隱藏充電專屬":"サポーター限定の投稿を隠す","隱藏專欄":"記事を隠す","內容含有這些詞就隱藏":"これらの語を含む投稿を隠す","每行一個詞；也可以寫 /正則/。比對動態文字、影片標題和被轉發的內容。改動後往下捲載入的新動態開始生效":"1 行に 1 語。/正規表現/ も使えます。投稿の本文、動画タイトル、リポスト元の内容と照合します。変更は、下にスクロールして読み込まれる投稿から反映されます","加入常見的廣告用詞":"よくある広告の語を追加","把一組常見的帶貨、促銷用語加進上面的清單，補足只靠商品卡片認不出來的廣告動態；之後可以自己增刪":"よくある販売・セールの言い回しをまとめて上のリストに追加し、商品カードだけでは見分けられない広告投稿を補います。あとで自由に増減できます","評論區":"コメント欄","備註":"メモ","IP 屬地":"IP 所在地","評論顯示 IP 屬地":"コメントに IP 所在地を表示","影片、動態、專欄、番劇、直播等頁面的評論與回覆":"動画、投稿、記事、アニメ、ライブなどのページのコメントと返信","專欄作者顯示 IP 屬地":"記事の著者の IP 所在地を表示","屬地文字替換":"所在地の文字を置き換える","JSON 鍵值對，例如 {\"IP属地：\":\"\"} 可去掉前綴":"JSON のキーと値の組。たとえば {\"IP属地：\":\"\"} で先頭の文字を消せます","用戶標記":"ユーザーマーク","評論顯示性別":"コメントに性別を表示","資料來自評論介面，未公開性別的用戶不顯示":"データはコメント API から取得します。性別を公開していないユーザーには表示しません","屬地文字替換不是合法 JSON，已忽略":"所在地の文字の置き換えが正しい JSON ではないため、無視しました","男":"男性","女":"女性","顯示":"表示","顯示用戶備註":"ユーザーメモを表示","評論區用戶名旁、空間頁，以及頁面上指向該用戶空間首頁的連結":"コメント欄のユーザー名の横、スペースページ、そのユーザーのスペースへのリンク","顯示方式":"表示方法","暱稱後加標籤":"名前のあとにタグ","只顯示備註":"メモだけ表示","輸入備註":"メモを入力","備註已儲存":"メモを保存しました","備註已刪除":"メモを削除しました","編輯備註":"メモを編集","刪除":"削除","取消":"キャンセル","儲存":"保存","點擊修改備註":"クリックしてメモを編集","給這位用戶加備註":"このユーザーにメモを付ける","備註：{0}":"メモ：{0}","＋ 備註":"＋ メモ","評論過濾":"コメントフィルタ","評論區快速拉黑":"コメント欄ですばやくブロック","滑鼠移到評論的用戶名那一行，出現「拉黑」；點一下加入 B站黑名單並收起他的評論；誤點的話到 B站的「黑名單」裡移除。需要已登入":"コメントのユーザー名の行にポインタを合わせると「ブロック」が出ます。押すとビリビリのブロックリストに追加し、その人のコメントを折りたたみます。押し間違えたときはビリビリの「ブロックリスト」から外してください。ログインが必要です","評論含有這些詞就隱藏":"これらの語を含むコメントを隠す","留空 = 不啟用。每行一個詞；也可以寫 /正則/。評論和樓中樓回覆都會比對":"空欄 = 無効。1 行に 1 語。/正規表現/ も使えます。コメントと返信の両方と照合します","隱藏帶貨評論":"商品紹介のコメントを隠す","評論裡帶有商品連結（藍色的購物車連結）就整條收起，常見於 UP 主置頂的工商廣告":"商品リンク（青いショッピングカートのリンク）のあるコメントをまるごと折りたたみます。投稿者が固定した広告コメントによくあります","已拉黑「{0}」，他的評論已收起":"「{0}」をブロックしました。その人のコメントは折りたたみました","加入 B站黑名單":"ビリビリのブロックリストに追加","拉黑":"ブロック","畫質":"画質","直播停用 P2P / 第三方 CDN":"ライブで P2P / サードパーティ CDN を無効にする","強制最高畫質（真・原畫）":"最高画質を強制（本当の原画）","連續載入失敗時會自動退回播放器選擇的畫質":"読み込みに続けて失敗すると、プレーヤーが選んだ画質に自動で戻します","介面":"画面","網頁全屏 / 全屏時隱藏禮物欄":"ウェブフルスクリーン / フルスクリーンでギフト欄を隠す","滑鼠移到畫面底部時不再彈出禮物列":"ポインタを映像の下端に動かしてもギフト欄が出なくなります","平時也隱藏禮物欄":"ふだんもギフト欄を隠す","播放器下方整條禮物 / 包裹列":"プレーヤーの下のギフト / バッグの列全体","隱藏榜單":"ランキングを隠す","聊天區上方的高能榜 / 大航海、標題列的人氣榜、禮物星球等入口":"チャット上部の高能ランキング / 大航海、タイトルバーの人気ランキング、ギフト星球などの入口","隱藏直播區廣告與活動":"ライブの広告とイベントを隠す","播放器下方的活動輪播、分區頁橫幅、小橙車、活動入口、播放器內的活動浮層":"プレーヤー下のイベントカルーセル、カテゴリページのバナー、ショッピングカート、イベントの入口、プレーヤー内のイベント表示","隱藏直播間雜項":"ライブルームの細かい表示を隠す","進場歡迎條、播放器角標":"入室の歓迎バー、プレーヤーの角のバッジ","隱藏直播間右側的浮動按鈕":"ライブルーム右側のフローティングボタンを隠す","貼在視窗右邊的「實驗室」「關注」那一條":"ウィンドウ右端の「実験室」「フォロー」の帯","直播畫面鋪滿頁面":"ライブ映像をページいっぱいに","去掉左右留白：畫面佔滿聊天欄以外的寬度和導航欄以下的高度，主播資訊浮在畫面上（滑鼠移到畫面才顯示），禮物欄往下捲才看得到。不是網頁全螢幕，頁面照常捲動":"左右の余白をなくします。映像はチャット欄以外の幅とナビゲーションバーより下の高さをすべて使い、配信者の情報は映像の上に重ねて表示します（ポインターを映像に載せたときだけ）。ギフト欄は下にスクロールすると表示されます。ウェブ全画面ではなく、ページは通常どおりスクロールできます","彈幕":"弾幕","檢查彈幕是否真的發出":"弾幕が本当に送信されたか確認","B站對被攔截的彈幕也回報「成功」；這裡會提示是系統攔截還是主播屏蔽詞":"ビリビリはブロックした弾幕にも「成功」と返します。システムによるブロックか、配信者の NG ワードかを知らせます","被攔截時自動複製內容":"ブロックされたら内容を自動でコピー","方便修改後重發":"直して送り直すときに便利です","發送成功也提示":"送信成功も知らせる","最高畫質不可用，已退回播放器選擇的畫質":"最高画質が使えないため、プレーヤーが選んだ画質に戻しました","系統攔截（全站敏感詞）":"システムによるブロック（サイト全体の NG ワード）","主播 / 房管屏蔽詞":"配信者 / モデレーターの NG ワード","彈幕發送失敗：{0}":"弾幕を送信できませんでした：{0}","彈幕已發出":"弾幕を送信しました","彈幕沒有發出：{0}{1}":"弾幕は送信されていません：{0}{1}"," · 內容已複製":" · 内容をコピーしました","彈幕查詢":"弾幕検索","這個頁面找不到影片 BV 號":"このページでは動画の BV 番号が見つかりません","取得分 P 列表失敗":"パート一覧を取得できませんでした","記住倍速":"再生速度を記憶","換影片、重新整理後沿用上次調的倍速":"動画を変えても再読み込みしても、前回の再生速度を引き継ぎます","彈幕預設":"弾幕の初期状態","不變":"変更しない","開":"オン","字幕預設":"字幕の初期状態","影片有字幕時才有作用":"動画に字幕があるときだけ働きます","快退 / 快進的秒數":"巻き戻し / 早送りの秒数","全螢幕時滾輪調音量":"フルスクリーンでホイールによる音量調整","滑鼠在畫面上滾動，每格 5%":"映像の上でスクロール。1 目盛りで 5%","播完自動退出全螢幕":"再生が終わったらフルスクリーンを解除","後面沒有接著播下一個影片時才退出":"続けて再生する動画がないときだけ解除します","截圖同時複製到剪貼簿":"スクリーンショットをクリップボードにもコピー","截圖一律會下載成 PNG；這項再多複製一份":"スクリーンショットは必ず PNG でダウンロードします。この項目はさらにコピーもします","響度均衡":"ラウドネス均一化","把太大聲的地方壓低、整體音量拉高，各影片聽起來差不多大聲。如果開了以後沒聲音，關掉並重新整理":"大きすぎる音を抑えて全体の音量を上げ、どの動画も同じくらいの大きさに聞こえるようにします。オンにして音が出なくなったら、オフにして再読み込みしてください","選集":"エピソード","合集播放順序":"シリーズの再生順","一集播完後接著播哪一集":"1 本終わったあと、次にどれを再生するか","正常":"通常","倒序":"逆順","隨機":"ランダム","複製連結時去掉追蹤參數":"リンクをコピーするとき追跡パラメータを外す","B站「分享 → 複製連結」得到的網址不再帶 vd_source、share_source 等":"ビリビリの「共有 → リンクをコピー」で得られる URL に vd_source、share_source などが付かなくなります","倍速 {0}×":"再生速度 {0}×","影片還沒載入，無法截圖":"動画がまだ読み込まれていないため、スクリーンショットを撮れません","無法取得畫面":"映像を取得できません","截圖已保存並複製（{0}）":"スクリーンショットを保存してコピーしました（{0}）","截圖已保存（{0}）":"スクリーンショットを保存しました（{0}）","截圖失敗：{0}":"スクリーンショットに失敗しました：{0}","畫面旋轉 {0}°":"映像を {0}° 回転","畫面旋轉：還原":"映像の回転：元に戻す","畫面鏡像：開":"映像の反転：オン","畫面鏡像：關":"映像の反転：オフ","已複製乾淨連結":"クリーンなリンクをコピーしました","複製失敗":"コピーに失敗しました","要先登入 B站才能加入稍後再看":"あとで見るに追加するにはビリビリにログインしてください","已加入稍後再看":"あとで見るに追加しました","加入稍後再看失敗：{0}":"あとで見るに追加できませんでした：{0}","已通知所有開著的影片分頁":"開いているすべての動画タブに通知しました","把所有開著的影片分頁加入稍後再看":"開いているすべての動画タブをあとで見るに追加","每個開著影片頁的分頁各自把自己加入；需要已登入":"動画ページを開いているタブがそれぞれ自分を追加します。ログインが必要です","響度均衡啟用失敗（播放器已經佔用了音訊處理）":"ラウドネス均一化を有効にできませんでした（プレーヤーがすでに音声処理を使っています）","下載":"ダウンロード","影片下載":"動画ダウンロード","影片頁工具列多一個「下載」，選清晰度後在瀏覽器裡下載並合成 MP4；能下載的清晰度和網頁上能看的一樣":"動画ページのツールバーに「ダウンロード」を追加します。画質を選ぶとブラウザでダウンロードして MP4 にまとめます。選べる画質はサイトで視聴できるものと同じです","優先的編碼":"優先するコーデック","AVC 幾乎所有播放器都能開；HEVC、AV1 檔案小一些，但舊的裝置可能播不了。影片沒有這種編碼時自動換別的":"AVC はほぼすべてのプレーヤーで再生できます。HEVC・AV1 はファイルが小さめですが、古い機器では再生できないことがあります。動画にそのコーデックがない場合は自動で別のものを使います","這部影片沒有可下載的格式":"この動画にはダウンロードできる形式がありません","下載中斷，請稍後再試":"ダウンロードが中断されました。しばらくしてからもう一度お試しください","下載中":"ダウンロード中","下載音訊":"音声をダウンロード","下載 {0}":"{0} をダウンロード","合成中":"結合中","已交給瀏覽器下載：{0}":"ブラウザに渡しました：{0}","已取消下載":"ダウンロードをキャンセルしました","下載失敗：{0}":"ダウンロードに失敗しました：{0}","讀取清晰度…":"画質を読み込み中…","{0} 需要大會員":"{0} は大会員（プレミアム会員）が必要です","登入後可下載更高畫質（{0}）":"ログインするとより高い画質をダウンロードできます（{0}）","影片很長：檔案會很大，瀏覽器需要足夠的記憶體":"長い動画です：ファイルが大きくなるため、ブラウザに十分なメモリが必要です","只要音訊":"音声のみ","讀取失敗：{0}":"読み込みに失敗しました：{0}","下載這部影片":"この動画をダウンロード","開關設定面板":"設定パネルを開閉","選集浮層":"エピソード一覧","合集 / 分 P 清單，全螢幕下也可以用":"シリーズ / パートの一覧。フルスクリーンでも使えます","這個影片沒有選集":"この動画にはエピソードがありません","畫中畫":"ピクチャ・イン・ピクチャ","找不到畫中畫按鈕":"ピクチャ・イン・ピクチャのボタンが見つかりません","畫面填滿播放器":"映像をプレーヤーいっぱいに広げる","裁切模式：開":"クロップモード：オン","裁切模式：關":"クロップモード：オフ","字幕開關":"字幕の切り替え","這個影片沒有字幕":"この動画には字幕がありません","播放 / 暫停":"再生 / 一時停止","快退":"巻き戻し","秒數在「播放頁 → 播放」裡設定":"秒数は「再生ページ → 再生」で設定します","快進":"早送り","上一幀":"前のフレーム","會先暫停":"先に一時停止します","下一幀":"次のフレーム","截圖":"スクリーンショット","以影片原始解析度存成 PNG":"動画の元の解像度で PNG として保存します","彈幕開關":"弾幕の切り替え","找不到彈幕開關":"弾幕のスイッチが見つかりません","畫面旋轉 90°":"映像を 90° 回転","畫面鏡像":"映像の反転","複製乾淨連結":"クリーンなリンクをコピー","不帶任何追蹤參數的影片網址":"追跡パラメータのない動画の URL","保存目前影片的封面":"現在の動画のサムネイルを保存","所有開著的影片分頁加入稍後再看":"開いている動画タブをすべてあとで見るに追加","加速 0.25×":"0.25× 速くする","減速 0.25×":"0.25× 遅くする","回到 1× 倍速":"1× に戻す","打開彈幕查詢":"弾幕検索を開く","網頁全屏":"ウェブフルスクリーン","全螢幕":"フルスクリーン","收起 / 展開聊天":"チャットを折りたたむ / 展開","網頁全屏或全螢幕時才有作用":"ウェブフルスクリーンかフルスクリーンのときだけ働きます","先進入網頁全屏或全螢幕，才能收起聊天":"チャットを折りたたむには、先にウェブフルスクリーンかフルスクリーンにしてください","不是這個腳本匯出的設定檔":"このスクリプトが書き出した設定ファイルではありません","設定面板":"設定パネル","還原全部預設值":"すべて既定値に戻す","再按一次確認。備註不會被清除":"もう一度押すと確定します。メモは消えません","所有開關、數值、快捷鍵回到預設；屏蔽詞和備註保留":"すべてのスイッチ、数値、ショートカットを既定に戻します。NG ワードとメモは残ります","確認還原":"戻すことを確定","還原":"戻す","已還原預設，重新整理後完全生效":"既定に戻しました。再読み込みすると完全に反映されます","匯出全部設定":"すべての設定を書き出す","所有開關、數值、快捷鍵、屏蔽詞和用戶備註存成一個 JSON 檔":"すべてのスイッチ、数値、ショートカット、NG ワード、ユーザーメモを 1 つの JSON ファイルに保存します","匯出":"書き出す","匯入設定":"設定を読み込む","讀取「匯出全部設定」存的檔案，覆蓋檔案裡有的項目，其餘不動":"「すべての設定を書き出す」で保存したファイルを読み込み、ファイルにある項目を上書きします。ほかはそのままです","選擇檔案":"ファイルを選択","已匯入 {0} 項設定，重新整理後完全生效":"{0} 件の設定を読み込みました。再読み込みすると完全に反映されます","匯入失敗：{0}":"読み込みに失敗しました：{0}","JSON 格式錯誤":"JSON の形式が正しくありません","複製診斷資訊":"診断情報をコピー","版面出問題時按一下，把複製到的文字貼給開發者。只有版面資訊，不含帳號和你的設定內容":"レイアウトがおかしいときに押して、コピーされた文字を開発者に貼り付けてください。レイアウトの情報だけで、アカウントや設定の内容は含みません","複製":"コピー","診斷資訊已複製":"診断情報をコピーしました","外觀":"外観","跟隨系統":"システムに合わせる","語言":"言語","「自動」會跟隨瀏覽器的語言":"「自動」はブラウザの言語に合わせます","強調色":"アクセントカラー","B站粉":"ビリビリピンク","B站藍":"ビリビリブルー","石墨":"グラファイト","快捷鍵":"ショートカット","減少":"減らす","增加":"増やす","重新整理頁面後生效":"ページを再読み込みすると反映されます","「{0}」已還原預設":"「{0}」を既定に戻しました","執行":"実行","寬屏版面的構想來自 posthumz 的 ":"ワイドレイアウトの着想は posthumz 氏の","，在此致謝。":" から得ました。感謝します。","關於":"このソフトについて","搜尋設定":"設定を検索","沒有符合的設定":"一致する設定がありません","搜尋結果":"検索結果","關閉":"閉じる"," 開關面板":" パネルを開閉","右鍵任一項還原預設":"項目を右クリックすると既定に戻ります","重新整理以套用":"再読み込みして適用","格式不對":"形式が正しくありません","備註清單":"メモ一覧","搜尋暱稱、備註或 UID":"名前、メモ、UID で検索","確認刪除":"削除を確定","（未知暱稱）":"（名前不明）","沒有符合的備註":"一致するメモがありません","還沒有備註。在評論區把滑鼠移到用戶名那一行點「備註」，或在空間頁點「＋ 備註」。":"メモはまだありません。コメント欄でユーザー名の行にポインタを合わせて「メモ」を押すか、スペースページで「＋ メモ」を押してください。","UID 只能是數字":"UID は数字だけです","請輸入備註":"メモを入力してください","已匯入 {0} 筆備註":"{0} 件のメモを読み込みました","匯入 JSON":"JSON を読み込む","新增":"追加","查詢":"検索","請在影片 / 番劇播放頁打開這一頁。":"動画 / アニメの再生ページでこのページを開いてください。","關鍵字（留空列出全部彈幕）":"キーワード（空欄ですべての弾幕を表示）","反查全部發送者":"すべての送信者を逆引き","反查中…":"逆引き中…","查不到":"見つかりません","UID 超過 11 位（2022 年後註冊的 16 位 UID）無法由彈幕反查":"11 桁を超える UID（2022 年以降に登録された 16 桁の UID）は弾幕から逆引きできません","反查":"逆引き","跳到這個時間":"この時間へ移動","日期":"日付","發送者":"送信者","反查中 {0}/{1}":"逆引き中 {0}/{1}","載入彈幕中…":"弾幕を読み込み中…","，只顯示前 {0} 條（加關鍵字縮小範圍）":"、最初の {0} 件だけ表示（キーワードで絞り込めます）","共 {0} 條{1}。點時間跳轉，點「反查」取得發送者（結果是 CRC32 對應的最小 UID；16 位新 UID 查不到或可能對應到別人）。":"全 {0} 件{1}。時間を押すと移動、「逆引き」で送信者を取得します（結果は CRC32 に対応する最小の UID です。16 桁の新しい UID は見つからないか、別の人に当たることがあります）。","沒有符合的彈幕":"一致する弾幕がありません","查詢失敗：{0}":"検索に失敗しました：{0}","按下按鍵…":"キーを押してください…","{0} 已經給「{1}」用了":"{0} はすでに「{1}」で使われています","點按鈕後按下新的按鍵組合。Esc 取消，Delete 停用，右鍵還原預設。打字時單鍵快捷鍵不會觸發；和 B站原有按鍵相同時，以這裡的為準。":"ボタンを押してから新しいキーの組み合わせを押します。Esc でキャンセル、Delete で無効、右クリックで既定に戻します。文字入力中は 1 キーのショートカットは働きません。ビリビリ本来のキーと同じ場合はこちらが優先されます。","設定已同步，重新整理後完全生效":"設定を同期しました。再読み込みすると完全に反映されます"}};

  const platform = {
    page: typeof unsafeWindow === 'undefined' ? window : unsafeWindow,

    ready: Promise.resolve(),

    storage: {
      get: (key) => GM_getValue(key),
      set: (key, value) => GM_setValue(key, value),
      remove: (key) => GM_deleteValue(key),

      subscribe(key, onChange) {
        GM_addValueChangeListener(key, (_key, _oldValue, value, remote) => {
          if (remote) onChange(value);
        });
      },
    },

    request({ url, responseType = 'text' }) {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: 'GET',
          url,
          responseType: responseType === 'blob' ? 'blob' : undefined,
          timeout: 30000,
          onload: (response) => {
            const result = { status: response.status };
            if (responseType === 'blob') result.blob = response.response;
            else result.text = response.responseText;
            resolve(result);
          },
          onerror: () => reject(new Error(`请求失败：${url}`)),
          ontimeout: () => reject(new Error(`请求超时：${url}`)),
        });
      });
    },

    copy: (text) => GM_setClipboard(text, 'text'),

    addMenu: (label, run) => GM_registerMenuCommand(label, run),
  };

  if (GM_getValue('aceess_key') !== undefined) GM_deleteValue('aceess_key');

  const W = platform.page;

  const IS_TOP = (() => {
    try {
      return window.top === window.self;
    } catch {
      return false;
    }
  })();
  const IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform);
  const IS_SAFARI = /Safari\//.test(navigator.userAgent) && !/Chrome|Chromium|Edg\//.test(navigator.userAgent);
  const VERSION = BUILD.version;

  const LOCALE_PREFIX = /^\/(?:zh-Hans|zh-Hant|en|ja|th|ar|pt|es|id|ms|ru|tr|vi)(?=\/|$)/;
  const HOST = location.host;

  const PATH = location.pathname.replace(LOCALE_PREFIX, '').replace(/^\/index\.html?$/, '/') || '/';

  const ON_WWW = HOST === 'www.bilibili.com';
  const PAGE = {
    www: ON_WWW,
    home: ON_WWW && PATH === '/',
    read: ON_WWW && PATH.startsWith('/read'),
    opus: ON_WWW && PATH.startsWith('/opus'),
    video: ON_WWW && PATH.startsWith('/video/'),
    bangumi: ON_WWW && PATH.startsWith('/bangumi/play/'),
    t: HOST === 't.bilibili.com',
    space: HOST === 'space.bilibili.com',
    message: HOST === 'message.bilibili.com',
    search: HOST === 'search.bilibili.com',
    live: HOST === 'live.bilibili.com',
  };

  const LOG_TAG = [`%c${BUILD.name}`, 'color:#fb7299;font-weight:bold'];
  const log = (...args) => console.info(...LOG_TAG, ...args);
  const warn = (...args) => console.warn(...LOG_TAG, ...args);

  const safe = (run, name) => {
    try {
      return run();
    } catch (error) {
      warn(`模块出错：${name || run.name}`, error);
      return undefined;
    }
  };

  const LANGUAGES = [
    ['zh-Hans', '简体中文'],
    ['zh-Hant', '繁體中文'],
    ['yue', '粵語'],
    ['en', 'English'],
    ['ja', '日本語'],
  ];

  const browserLanguage = () => {
    for (const tag of navigator.languages?.length ? navigator.languages : [navigator.language || '']) {
      if (/^yue/i.test(tag)) return 'yue';
      if (/^zh-(?:TW|HK|MO|Hant)/i.test(tag)) return 'zh-Hant';
      if (/^zh/i.test(tag)) return 'zh-Hans';
      if (/^ja/i.test(tag)) return 'ja';
      if (/^en/i.test(tag)) return 'en';
    }
    return 'en';
  };

  const LANGUAGE = (() => {
    let chosen;
    try {
      chosen = platform.storage.get('x.lang');
    } catch {
    }
    return LANGUAGES.some(([id]) => id === chosen) ? chosen : browserLanguage();
  })();
  const DICTIONARY = I18N[LANGUAGE] || {};

  const t = (text, ...values) => {
    const key = Array.isArray(text) ? text.reduce((whole, part, index) => `${whole}{${index - 1}}${part}`) : text;
    const translated = DICTIONARY[key] ?? key.replace(/^\[[^\]]*\]/, '');
    return values.length ? translated.replace(/\{(\d+)\}/g, (_, index) => String(values[index])) : translated;
  };

  const PRODUCT = /^(?:en|ja)$/.test(LANGUAGE) ? BUILD.name : `${BUILD.name} ${t('比利重啟')}`;

  const COMPACT_NUMBER = new Intl.NumberFormat({ yue: 'zh-Hant' }[LANGUAGE] || LANGUAGE, {
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  const storeListeners = new Map();
  const notifyStore = (key, value) => {
    for (const listener of storeListeners.get(key) || []) safe(() => listener(value), `监听 ${key}`);
  };

  const store = {
    get(key, fallback) {
      try {
        const value = platform.storage.get(key);
        return value === undefined ? fallback : value;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        platform.storage.set(key, value);
      } catch (error) {
        warn(error);
      }
      notifyStore(key, value);
    },
    del(key) {
      try {
        platform.storage.remove(key);
      } catch (error) {
        warn(error);
      }
      notifyStore(key, undefined);
    },

    on(key, listener) {
      if (!storeListeners.has(key)) {
        storeListeners.set(key, []);
        try {
          platform.storage.subscribe(key, (value) => notifyStore(key, value));
        } catch {
        }
      }
      storeListeners.get(key).push(listener);
    },
  };

  const OPTS = {};

  const TABS = [];

  const ACTIONS = [];

  const defOpt = (key, def, meta) => {
    OPTS[key] = { key, def, type: typeof def === 'number' ? 'num' : 'bool', ...meta };
  };
  const val = (key) => store.get(key, OPTS[key]?.def);

  const watch = (key, onValue) => {
    onValue(val(key));
    store.on(key, (value) => onValue(value === undefined ? OPTS[key].def : value));
  };

  const TOKEN_ATTR = 'data-bga';
  const tokens = new Set();
  const rootQueue = [];

  const onRoot = (run) => {
    if (document.documentElement) run(document.documentElement);
    else rootQueue.push(run);
  };
  if (!document.documentElement) {
    new MutationObserver((_, observer) => {
      if (!document.documentElement) return;
      observer.disconnect();
      for (const run of rootQueue.splice(0)) run(document.documentElement);
    }).observe(document, { childList: true });
  }

  const flag = (token, on) => {
    if (on) tokens.add(token);
    else tokens.delete(token);
    onRoot((root) => root.setAttribute(TOKEN_ATTR, [...tokens].join(' ')));
  };
  const hasFlag = (token) => tokens.has(token);

  const reflect = (key, token, invert = false) => watch(key, (value) => flag(token, invert ? !value : !!value));

  const setRootVar = (name, value) => {
    onRoot((root) => {
      if (value == null) root.style.removeProperty(name);
      else root.style.setProperty(name, value);
    });
  };

  const HOTKEYS = [];

  const defKey = (id, def, meta) => {
    HOTKEYS.push({ id, def, ...meta });
  };
  const keyMap = () => {
    const map = store.get('x.keys');
    return map && typeof map === 'object' ? map : {};
  };
  const keyOf = (hotkey) => {
    const custom = keyMap()[hotkey.id];
    return typeof custom === 'string' ? custom : hotkey.def;
  };

  const comboOf = (event) => {
    if (!event.code || /^(Shift|Control|Alt|Meta|OS)(Left|Right)?$/.test(event.code)) return '';
    const modifiers = [
      event.ctrlKey && 'Ctrl',
      event.altKey && 'Alt',
      event.shiftKey && 'Shift',
      event.metaKey && 'Meta',
    ];
    return [...modifiers.filter(Boolean), event.code].join('+');
  };

  const KEY_NAMES = {
    Space: t('空白鍵'),
    Period: '.',
    Comma: ',',
    Slash: '/',
    Backslash: '\\',
    Semicolon: ';',
    Quote: "'",
    BracketLeft: '[',
    BracketRight: ']',
    Minus: '-',
    Equal: '=',
    Backquote: '`',
    ArrowLeft: '←',
    ArrowRight: '→',
    ArrowUp: '↑',
    ArrowDown: '↓',
    Enter: 'Enter',
    Tab: 'Tab',
  };
  const MAC_MODIFIERS = { Ctrl: '⌃', Alt: '⌥', Shift: '⇧', Meta: '⌘' };

  const comboText = (combo) => {
    if (!combo) return '';
    const parts = combo.split('+');
    const code = parts.pop();
    const key = KEY_NAMES[code] || code.replace(/^Key|^Digit/, '').replace(/^Numpad/, t('數字鍵盤 '));
    const modifiers = parts.map((name) => (IS_MAC ? MAC_MODIFIERS[name] : `${name === 'Meta' ? 'Win' : name}+`));
    return modifiers.join('') + key;
  };

  let keyCapturing = false;

  const h = (tag, props = {}, ...children) => {
    const el = document.createElement(tag);
    for (const [name, value] of Object.entries(props)) {
      if (name === 'class') el.className = value;
      else if (name === 'style') el.style.cssText = value;
      else if (name === 'dataset') Object.assign(el.dataset, value);
      else if (name.startsWith('on') && typeof value === 'function') el.addEventListener(name.slice(2), value);
      else if (value !== false && value != null) el.setAttribute(name, value === true ? '' : value);
    }
    for (const child of children.flat()) {
      if (child != null && child !== false) el.append(child);
    }
    return el;
  };

  const svgIcon = (inner, size = 16) => {
    const source = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" aria-hidden="true">${inner}</svg>`;
    return document.importNode(new DOMParser().parseFromString(source, 'image/svg+xml').documentElement, true);
  };

  const ownStyles = [];
  const addStyle = (css, name = '') => {
    const style = document.createElement('style');
    style.dataset.bgaStyle = name;
    style.textContent = css;
    ownStyles.push(style);
    onRoot((root) => (document.head || root).appendChild(style));
    return style;
  };

  const restoreStyles = () => {
    const root = document.documentElement;
    if (!root) return;
    for (const style of ownStyles) {
      if (!style.isConnected) (document.head || root).appendChild(style);
    }
    const wanted = [...tokens].join(' ');
    if (root.getAttribute(TOKEN_ATTR) !== wanted) root.setAttribute(TOKEN_ATTR, wanted);
  };
  const guardStyles = () => {
    new MutationObserver(restoreStyles).observe(document, { childList: true });
    document.addEventListener('DOMContentLoaded', restoreStyles);
    addEventListener('load', restoreStyles);
    addEventListener('pageshow', restoreStyles);
    for (const delay of [0, 100, 400, 1500, 4000]) setTimeout(restoreStyles, delay);
  };

  const toggleStyle = (css, name = '') => {
    const style = addStyle(css, name);
    return (on) => {
      style.media = on ? 'all' : 'not all';
    };
  };

  const ready = () =>
    new Promise((resolve) => {
      if (document.readyState !== 'loading') resolve();
      else document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
    });
  const bodyReady = () =>
    new Promise((resolve) => {
      if (document.body) return resolve();
      new MutationObserver((_, observer) => {
        if (!document.body) return;
        observer.disconnect();
        resolve();
      }).observe(document, { childList: true, subtree: true });
    });

  const waitFor = (probe, description = '元素', timeout = 15000, interval = 100) =>
    new Promise((resolve, reject) => {
      const first = probe();
      if (first) return resolve(first);
      const startedAt = Date.now();
      const timer = setInterval(() => {
        const found = probe();
        if (found) {
          clearInterval(timer);
          resolve(found);
        } else if (Date.now() - startedAt > timeout) {
          clearInterval(timer);
          reject(new Error(`${description}等待超时`));
        }
      }, interval);
    });

  const observeChild = (className, parent) =>
    new Promise((resolve) => {
      const find = () => [...parent.children].find((child) => child.classList.contains(className));
      const existing = find();
      if (existing) return resolve(existing);
      const observer = new MutationObserver(() => {
        const child = find();
        if (!child) return;
        observer.disconnect();
        resolve(child);
      });
      observer.observe(parent, { childList: true });
    });

  const OWN_UI =
    '#bilibili-player, #live-player, #bga-panel, .bga-toasts, #bga-card-tools, #bga-card-zoom, #bga-memo-pop';
  const pageObserver = (onChange) =>
    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const el = mutation.target.nodeType === Node.ELEMENT_NODE ? mutation.target : mutation.target.parentElement;
        if (el && !el.closest(OWN_UI)) return void onChange();
      }
    });

  const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement || null;

  const copyNow = (text) => {
    try {
      const box = h('textarea', { style: 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0' });
      box.value = text;
      (document.querySelector('#bga-panel:popover-open') || document.body).appendChild(box);
      box.focus();
      box.select();
      const copied = document.execCommand('copy');
      box.remove();
      if (copied) return true;
    } catch {
    }
    try {
      navigator.clipboard.writeText(text);
      return true;
    } catch {
    }
    try {
      platform.copy(text);
      return true;
    } catch {
      return false;
    }
  };

  const toast = (() => {
    let box = null;
    return (message, kind = 'info', duration = 3200, key = '') => {
      if (!document.body) return;
      box ||= h('div', { class: 'bga-toasts bga-ui', dataset: { accent: store.get('x.ui.accent', 'pink') } });

      const fullscreen = fullscreenElement();
      const host = fullscreen && fullscreen.tagName !== 'VIDEO' ? fullscreen : document.body;
      if (box.parentElement !== host) host.appendChild(box);

      let item = key ? [...box.children].find((child) => child.dataset.key === key) : null;
      if (item) {
        item.textContent = message;
        clearTimeout(item.bgaTimer);
      } else {
        item = box.appendChild(h('div', { class: `bga-toast bga-toast-${kind}`, dataset: key ? { key } : {} }, message));
        requestAnimationFrame(() => item.classList.add('bga-in'));
      }
      const shown = item;
      shown.bgaTimer = setTimeout(() => {
        shown.classList.remove('bga-in');
        delete shown.dataset.key;
        setTimeout(() => shown.remove(), 400);
      }, duration);
    };
  })();

  const fetchHooks = [];

  const urlOfFetchInput = (input) => {
    if (typeof input === 'string') return input;
    if (typeof input?.href === 'string') return input.href;
    return input?.url;
  };

  const hookFetch = (hook) => {
    fetchHooks.push(hook);
    if (fetchHooks.length > 1 || typeof W.fetch !== 'function') return;

    const nativeFetch = W.fetch;
    W.fetch = function (...args) {
      const afters = [];
      let url;
      try {
        url = urlOfFetchInput(args[0]);
      } catch {
      }
      if (typeof url === 'string') {
        for (const run of fetchHooks) {
          let verdict;
          try {
            verdict = run(url, args);
          } catch (error) {
            warn(error);
          }
          if (!verdict) continue;
          if (verdict.block === 'reject') return Promise.reject(new TypeError('blocked'));
          if (verdict.block) return new Promise(() => {});
          if (verdict.url && typeof args[0] === 'string') {
            url = verdict.url;
            args[0] = url;
          }
          if (verdict.after) afters.push(verdict.after);
        }
      }
      let pending = nativeFetch.apply(this, args);
      for (const after of afters) {
        pending = pending.then(async (response) => {
          try {
            return (await after(response)) || response;
          } catch (error) {
            warn(error);
            return response;
          }
        });
      }
      return pending;
    };
  };

  const xhrHooks = [];

  const rewriteXhrResponse = (xhr, rewrite) => {
    const proto = W.XMLHttpRequest.prototype;
    const nativeText = Object.getOwnPropertyDescriptor(proto, 'responseText');
    const nativeResponse = Object.getOwnPropertyDescriptor(proto, 'response');
    if (!nativeText?.get || !nativeResponse?.get) return;

    let ran = false;
    let rewritten;
    let parsed;
    const rewriteOnce = (raw) => {
      if (!ran) {
        ran = true;
        try {
          rewritten = rewrite(raw);
        } catch (error) {
          warn(error);
        }
      }
      return typeof rewritten === 'string' ? rewritten : undefined;
    };
    const readText = () => {
      const raw = nativeText.get.call(xhr);
      if (xhr.readyState !== 4 || typeof raw !== 'string') return raw;
      return rewriteOnce(raw) ?? raw;
    };

    Object.defineProperty(xhr, 'responseText', { configurable: true, get: readText });
    Object.defineProperty(xhr, 'response', {
      configurable: true,
      get() {
        const type = xhr.responseType;
        if (type === '' || type === 'text') return readText();
        const raw = nativeResponse.get.call(xhr);
        if (type !== 'json' || xhr.readyState !== 4 || raw == null) return raw;
        const text = rewriteOnce(JSON.stringify(raw));
        if (text === undefined) return raw;
        try {
          parsed ??= W.JSON.parse(text);
          return parsed;
        } catch {
          return raw;
        }
      },
    });
  };

  const hookXHR = (hook) => {
    xhrHooks.push(hook);
    if (xhrHooks.length > 1) return;

    const nativeOpen = W.XMLHttpRequest.prototype.open;
    W.XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      try {
        delete this.responseText;
        delete this.response;
      } catch {
      }
      let target = url;
      if (typeof target === 'string') {
        for (const run of xhrHooks) {
          let verdict;
          try {
            verdict = run(target, this);
          } catch (error) {
            warn(error);
          }
          if (!verdict) continue;
          if (verdict.block) this.send = function () {};
          if (verdict.url) target = verdict.url;
          if (verdict.rewrite) safe(() => rewriteXhrResponse(this, verdict.rewrite), '改写 XHR 响应');
        }
      }
      return nativeOpen.call(this, method, target, ...rest);
    };
  };

  const litHooks = new Map();
  let litDefinePatched = false;

  const deepQueryAll = (tag, scope = document, found = []) => {
    for (const el of scope.querySelectorAll('*')) {
      if (el.localName === tag) found.push(el);
      if (el.shadowRoot) deepQueryAll(tag, el.shadowRoot, found);
    }
    return found;
  };

  const patchLitComponent = (tag, constructor) => {
    const proto = constructor?.prototype;
    if (!proto || typeof proto.update !== 'function' || Object.hasOwn(proto, '__bgaPatched')) return;
    const nativeUpdate = proto.update;
    proto.update = function (...args) {
      const result = nativeUpdate.apply(this, args);
      for (const run of litHooks.get(tag) || []) {
        try {
          run(this);
        } catch (error) {
          warn(`评论组件 ${tag}`, error);
        }
      }
      return result;
    };
    Object.defineProperty(proto, '__bgaPatched', { value: true });
  };

  const hookLit = (tag, onRender) => {
    if (!litHooks.has(tag)) litHooks.set(tag, []);
    litHooks.get(tag).push(onRender);
    const registry = W.customElements;
    if (!registry) return;

    if (!litDefinePatched) {
      litDefinePatched = true;
      const nativeDefine = registry.define;
      registry.define = function (name, constructor, ...rest) {
        if (litHooks.has(name)) safe(() => patchLitComponent(name, constructor), '评论组件补丁');
        return nativeDefine.call(this, name, constructor, ...rest);
      };
    }

    const defined = registry.get(tag);
    if (!defined) return;
    patchLitComponent(tag, defined);
    ready().then(() => {
      for (const el of deepQueryAll(tag)) safe(() => onRender(el), `评论组件 ${tag}`);
    });
  };

  const globalWatchers = new Map();

  const onGlobal = (name, onValue) => {
    if (W[name] !== undefined) return void safe(() => onValue(W[name]), `全局变量 ${name}`);
    if (globalWatchers.has(name)) return void globalWatchers.get(name).push(onValue);

    const watchers = [onValue];
    globalWatchers.set(name, watchers);
    const announce = (value) => {
      for (const run of watchers) safe(() => run(value), `全局变量 ${name}`);
    };
    let current;
    try {
      Object.defineProperty(W, name, {
        configurable: true,
        enumerable: true,
        get: () => current,
        set: (value) => {
          current = value;
          announce(value);
        },
      });
    } catch {
      ready().then(() => {
        if (W[name] !== undefined) announce(W[name]);
      });
    }
  };

  TABS.push(['general', t('通用')], ['home', t('首頁')], ['video', t('播放頁')], ['feed', t('動態 · 空間')]);

  defOpt('左右边距', 30, {
    tab: 'general',
    group: t('版面'),
    label: t('左右邊距'),
    hint: t('所有頁面內容區兩側的留白，不會超過視窗寬度的 15%'),
    unit: 'px',
  });
  defOpt('粘性侧栏', false, {
    tab: 'feed',
    group: t('動態頁'),
    label: t('側欄吸頂'),
    hint: t('側欄內容較長時可能顯示不全'),
  });
  defOpt('x.hideGoods', true, { tab: 'feed', group: t('動態頁'), label: t('隱藏帶貨動態') });

  function setupDynamicPage() {
    flag('page-dynamic', true);
    reflect('粘性侧栏', 'aside-sticky');

    waitFor(() => document.querySelector('[class^="bili-dyn-home"] > aside.right'), '动态页右栏')
      .then((right) => right.parentElement.querySelector(':scope > aside.left')?.append(right))
      .catch(() => {});
  }

  function setupWide() {
    watch('左右边距', (px) => setRootVar('--bga-gutter-size', `${px}px`));
    if (PAGE.t || PAGE.space) reflect('x.hideGoods', 'no-goods');

    if (PAGE.home) flag('page-home', true);
    else if (PAGE.opus) flag('page-opus', true);
    else if (PAGE.read) return;
    else if (PAGE.www) setupStage().catch((error) => warn('播放页舞台', error));
    else if (PAGE.t) setupDynamicPage();
    else if (PAGE.space) flag('page-space', true);
    else if (PAGE.search) flag('page-search', true);
    else if (PAGE.message) flag('page-message', true);
  }

  defOpt('x.stage', true, {
    tab: 'video',
    group: t('播放器'),
    label: t('播放器撐滿視窗'),
    hint: t('關閉後播放頁回到原本的版面：播放器在左、推薦在右，選集浮層和小窗調整也一併停用'),
    reload: true,
  });
  defOpt('自动高度', true, {
    tab: 'video',
    group: t('播放器'),
    label: t('自動高度'),
    hint: t('播放器跟隨影片比例，上下不留黑邊'),
  });
  defOpt('预留高度', 96, {
    tab: 'video',
    group: t('播放器'),
    label: t('預留高度'),
    hint: t('播放器下方露出多少頁面內容；大於 0 時導航欄常駐。不會超過視窗高度的 25%'),
    unit: 'px',
  });
  defOpt('导航栏下置', true, { tab: 'video', group: t('導航欄'), label: t('導航欄放在播放器下方') });
  defOpt('粘性导航栏', true, {
    tab: 'video',
    group: t('導航欄'),
    label: t('導航欄吸頂'),
    hint: t('向下捲動時導航欄固定在視窗頂部'),
  });
  defOpt('紧凑控件间距', true, {
    tab: 'video',
    group: t('控制欄'),
    label: t('緊湊控制欄'),
    hint: t('按鈕收到圖示大小、間距收緊，省下的寬度都給彈幕輸入框'),
  });
  defOpt('显示观看信息', true, { tab: 'video', group: t('控制欄'), label: t('顯示在看人數 / 彈幕數') });
  defOpt('隐藏控件', true, {
    tab: 'video',
    group: t('控制欄'),
    label: t('平時隱藏控制欄'),
    hint: t('滑鼠移到播放器底部才顯示'),
  });
  defOpt('暂停显示控件', false, { tab: 'video', group: t('控制欄'), label: t('暫停時一直顯示控制欄') });
  defOpt('小窗样式', true, {
    tab: 'video',
    group: '小窗',
    label: t('小窗可調整'),
    hint: t('拖小窗左邊緣改寬度，拖小窗本身改位置，並記住'),
  });

  const PLAYER_PATH = /^\/(video|bangumi\/play|list|medialist|cheese\/play)\//;

  const isFestivalPage = () => PATH.startsWith('/festival/') || !!document.querySelector('.festival-video-player');

  const updateKeep = () => {
    const extra = val('预留高度');
    const navOnTop = !val('导航栏下置');
    let keep = '0px';
    if (extra > 0) keep = `calc(var(--bga-nav) + ${extra}px)`;
    else if (navOnTop) keep = 'var(--bga-nav)';
    setRootVar('--bga-keep', keep);
  };

  const trackStageHeight = (container) => {
    const measure = () => {
      if (container.dataset.screen === 'mini' || fullscreenElement()) return;

      const video = container.querySelector('.bpx-player-video-wrap > video');
      if (video && video.videoWidth === 0 && !hasFlag('fill-stage')) return;
      const height = Math.round(container.getBoundingClientRect().height);
      setRootVar('--bga-stage', height > 0 && height <= window.innerHeight ? `${height}px` : null);
    };
    new ResizeObserver(measure).observe(container);
  };

  const pinWebLayout = (container) => {
    const pin = () => {
      const screen = container.dataset.screen;
      if (screen !== 'web' && screen !== 'mini') container.dataset.screen = 'web';
    };
    new MutationObserver(pin).observe(container, { attributes: true, attributeFilter: ['data-screen'] });
    pin();
  };

  const dockDanmakuBar = async (container) => {
    const locate = () => {
      const bar = container.querySelector('.bpx-player-sending-bar');
      const slot = container.querySelector('.bpx-player-control-bottom-center');

      return bar?.querySelector('.bpx-player-dm-root') && slot ? { bar, slot } : null;
    };
    try {
      await waitFor(locate, '弹幕输入栏', 30000, 200);
    } catch {
      flag('dm-docked', false);
      return void warn('没找到弹幕输入栏，控制栏保持原样');
    }

    const dock = () => {
      const found = locate();
      if (!found) return;
      if (found.bar.parentElement !== found.slot) found.slot.append(found.bar);
      flag('dm-docked', true);
    };
    dock();
    const origin = container.querySelector('.bpx-player-sending-area');
    if (origin) new MutationObserver(dock).observe(origin, { childList: true });
    new MutationObserver(dock).observe(container, { attributes: true, attributeFilter: ['data-screen'] });
  };

  const MINI_KEYS = { right: '小窗右', bottom: '小窗下', width: '小窗宽度' };
  const MINI_DEFAULTS = { right: 52, bottom: 8, width: 320 };
  const MINI_MIN_WIDTH = 180;

  const trackDrag = (onMove, onDrop) => {
    const abort = new AbortController();
    const finish = () => {
      abort.abort();
      onDrop();
    };
    window.addEventListener('pointermove', onMove, { signal: abort.signal });
    window.addEventListener('pointerup', finish, { signal: abort.signal });
    window.addEventListener('pointercancel', finish, { signal: abort.signal });
  };

  const setupMini = (container) => {
    const applyMini = (name, value) => setRootVar(`--bga-mini-${name}`, `${value ?? MINI_DEFAULTS[name]}px`);
    for (const [name, key] of Object.entries(MINI_KEYS)) {
      applyMini(name, store.get(key));
      store.on(key, (value) => applyMini(name, value));
    }
    ACTIONS.push({
      tab: 'video',
      group: '小窗',
      label: t('小窗位置與寬度'),
      hint: t('回到右下角、預設寬度'),
      button: t('重設'),
      run() {
        for (const key of Object.values(MINI_KEYS)) store.del(key);
        toast(t('小窗已重設'));
      },
    });

    const grip = h('div', { class: 'bga-mini-grip' });
    grip.addEventListener('mousedown', (event) => event.stopPropagation());
    grip.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || !hasFlag('mini')) return;
      event.preventDefault();
      event.stopPropagation();
      const rightEdge = container.getBoundingClientRect().right;
      let width;
      trackDrag(
        (move) => {
          width = Math.round(Math.max(MINI_MIN_WIDTH, rightEdge - move.clientX));
          applyMini('width', width);
        },
        () => {
          if (width) store.set(MINI_KEYS.width, width);
        },
      );
    });

    const startMove = (event) => {
      if (event.button !== 0 || !hasFlag('mini') || event.target.closest('.bga-mini-grip, .bpx-player-mini-close'))
        return;
      const box = container.getBoundingClientRect();
      const grabX = box.right - event.clientX;
      const grabY = box.bottom - event.clientY;
      let right;
      let bottom;
      trackDrag(
        (move) => {
          right = Math.round(
            Math.min(Math.max(0, window.innerWidth - move.clientX - grabX), window.innerWidth - box.width),
          );
          bottom = Math.round(
            Math.min(Math.max(0, window.innerHeight - move.clientY - grabY), window.innerHeight - box.height),
          );
          applyMini('right', right);
          applyMini('bottom', bottom);
        },
        () => {
          if (right === undefined) return;
          store.set(MINI_KEYS.right, right);
          store.set(MINI_KEYS.bottom, bottom);
        },
      );
    };

    const videoArea = container.querySelector('.bpx-player-video-area');
    if (!videoArea) return;
    observeChild('bpx-player-mini-warp', videoArea).then((layer) => {
      layer.append(grip);
      layer.addEventListener('pointerdown', startMove);
    });
  };

  const fixFullscreenButton = (container) => {
    container.addEventListener(
      'click',
      (event) => {
        if (!fullscreenElement() || !event.target.closest?.('.bpx-player-ctrl-full')) return;
        event.stopPropagation();
        event.preventDefault();
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.webkitCancelFullScreen;
        try {
          Promise.resolve(exit?.call(document)).catch(() => {});
        } catch {
        }
      },
      true,
    );
  };

  const holdStageUntilSized = () => {
    flag('stage-pending', true);
    const abort = new AbortController();
    const release = () => {
      abort.abort();
      flag('stage-pending', false);
    };
    const check = (event) => {
      const video = event.target;
      if (video instanceof HTMLVideoElement && video.videoWidth > 0 && video.closest('#bilibili-player')) release();
    };

    for (const type of ['loadedmetadata', 'resize', 'playing']) {
      document.addEventListener(type, check, { capture: true, signal: abort.signal });
    }
    setTimeout(release, 10000);
  };

  async function setupStage() {
    if (!val('x.stage')) return void log('播放页舞台已关闭，保持原版面');

    const certain = PLAYER_PATH.test(PATH);
    flag('page-player', certain);
    if (certain) {
      flag('dm-docked', true);
      holdStageUntilSized();
    }
    reflect('导航栏下置', 'nav-top', true);
    reflect('粘性导航栏', 'nav-sticky');
    reflect('自动高度', 'fill-stage', true);
    reflect('紧凑控件间距', 'compact');
    reflect('显示观看信息', 'viewers');
    reflect('隐藏控件', 'quiet');
    reflect('暂停显示控件', 'pause-controls');
    reflect('小窗样式', 'mini');
    watch('预留高度', updateKeep);
    store.on('导航栏下置', updateKeep);

    await ready();
    if (!document.getElementById('bilibili-player') || isFestivalPage()) {
      flag('stage-pending', false);
      return void flag('page-player', false);
    }
    flag('page-player', true);

    const container = await waitFor(
      () => document.querySelector('#bilibili-player .bpx-player-container'),
      '播放器容器',
      30000,
    );
    trackStageHeight(container);
    pinWebLayout(container);
    dockDanmakuBar(container);
    fixFullscreenButton(container);
    safe(() => setupMini(container), '小窗');
    safe(() => setupPod(container), '选集浮层');
    log('播放页舞台已启用');
  }

  defOpt('x.nav.card', true, {
    tab: 'general',
    group: t('導航欄'),
    label: t('使用 Re:Bi 的導航欄'),
    hint: t('整條導航欄換成同一套方磚，每個頁面都一樣；個人卡片從頭像打開。關閉後回到原本的導航欄'),
    reload: true,
  });
  defOpt('x.nav.peek', true, {
    tab: 'general',
    group: t('導航欄'),
    label: t('滑過入口時顯示預覽'),
    hint: t('滑鼠停在消息、動態、收藏、歷史上，直接看到最近的內容'),
  });

  const NAV_ENTRIES = [
    ['message', t('消息'), 'mail', 'https://message.bilibili.com/'],
    ['dynamic', t('動態'), 'windmill', 'https://t.bilibili.com/'],
    ['fav', t('收藏'), 'star', ''],
    ['history', t('歷史'), 'clock', 'https://www.bilibili.com/history'],
  ];
  for (const [name, label] of NAV_ENTRIES) {
    defOpt(`x.nav.${name}`, true, { tab: 'general', group: t('導航欄右側的入口'), label });
  }

  const NAV_ICONS = {
    home: '<path d="M5 12l-2 0l9 -9l9 9l-2 0"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"/><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"/>',
    search: '<circle cx="10" cy="10" r="7"/><path d="M21 21l-6 -6"/>',
    dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    chevron: '<path d="M15 6l-6 6l6 6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6l9 -6"/>',
    windmill:
      '<path d="M12 12c2.76 0 5 -2.01 5 -4.5s-2.24 -4.5 -5 -4.5v9z"/><path d="M12 12c0 2.76 2.01 5 4.5 5s4.5 -2.24 4.5 -5h-9z"/><path d="M12 12c-2.76 0 -5 2.01 -5 4.5s2.24 4.5 5 4.5v-9z"/><path d="M12 12c0 -2.76 -2.01 -5 -4.5 -5s-4.5 2.24 -4.5 5h9z"/>',
    logout:
      '<path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"/><path d="M9 12h12l-3 -3"/><path d="M18 15l3 -3"/>',
    star: '<path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
    user: '<circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/>',
    video:
      '<path d="M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z"/><rect x="3" y="6" width="12" height="12" rx="2"/>',
    bookmark: '<path d="M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z"/>',
    crown: '<path d="M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4z"/>',
    shield: '<path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"/>',
    moon: '<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"/>',
    flame: '<path d="M12 12c2 -2.96 0 -7 -1 -8c0 3.038 -1.773 4.741 -3 6c-1.226 1.26 -2 3.24 -2 5a6 6 0 1 0 12 0c0 -1.532 -1.056 -3.94 -2 -5c-1.786 3 -2.791 3 -4 2z"/>',
  };
  const navIcon = (name) =>
    svgIcon(
      `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${NAV_ICONS[name]}</g>`,
      24,
    );

  function setupNavCard() {
    const supported = PAGE.www || PAGE.search || PAGE.t || PAGE.space || PAGE.live;
    if (!supported || !val('x.nav.card')) return;
    flag('nav-own', true);

    const SPACE = 'https://space.bilibili.com/';
    const CALM = window.matchMedia('(prefers-reduced-motion: reduce)');
    const number = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

    const picture = (address, width, height = width) => {
      const secure = String(address || '').replace(/^(https?:)?\/\//, 'https://');
      return /^https:\/\/[\w.-]+\.hdslb\.com\/[\w./-]+$/.test(secure) ? `${secure}@${width}w_${height}h_1c.webp` : '';
    };

    const safeLink = (address, fallback) => {
      const full = String(address || '').replace(/^\/\//, 'https://');
      return /^https:\/\/[\w.-]+\.bilibili\.com\//.test(full) ? full : fallback;
    };

    const whenIdle = (run) => {
      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        if (window.requestIdleCallback) requestIdleCallback(run, { timeout: 3000 });
        else setTimeout(run, 600);
      };
      if (document.readyState === 'complete') return void start();
      window.addEventListener('load', start, { once: true });
      setTimeout(start, 4000);
    };
    const fresh = new Map();

    const cached = (key, ttl, load) => {
      const hit = fresh.get(key);
      if (hit && Date.now() - hit.time < ttl) return hit.promise;
      const promise = load().catch((error) => {
        fresh.delete(key);
        throw error;
      });
      fresh.set(key, { time: Date.now(), promise });
      return promise;
    };
    const api = async (url) => {
      const result = await dm.getJSON(url);
      if (result?.code !== 0) throw new Error(result?.message || `code ${result?.code}`);
      return result.data ?? result.result;
    };

    const section = PAGE.live ? 'live' : PAGE.home ? 'home' : /^\/(anime|bangumi)\b/.test(PATH) ? 'anime' : '';

    const tileLink = (id, label, href, icon) =>
      h(
        'a',
        { class: `bga-nav-t${icon ? ' bga-nav-i' : ''}${section === id ? ' bga-on' : ''}`, href, title: icon ? label : null },
        icon ? navIcon(icon) : label,
      );
    const home = tileLink('home', t('首頁'), 'https://www.bilibili.com/', 'home');
    const leftLinks = h(
      'div',
      { class: 'bga-nav-fold' },
      tileLink('anime', t('番劇'), 'https://www.bilibili.com/anime/'),
      tileLink('live', t('直播'), 'https://live.bilibili.com/'),
    );
    const MORE_LINKS = [
      [t('熱門'), 'https://www.bilibili.com/v/popular/all'],
      [t('排行榜'), 'https://www.bilibili.com/v/popular/rank/all'],
      [t('遊戲中心'), 'https://game.bilibili.com/platform/'],
      [t('會員購'), 'https://show.bilibili.com/platform/home.html'],
      [t('漫畫'), 'https://manga.bilibili.com/'],
      [t('賽事'), 'https://www.bilibili.com/match/home/'],
      [t('課堂'), 'https://www.bilibili.com/cheese/'],
    ];
    const menu = h(
      'div',
      { class: 'bga-nav-pop bga-nav-menu', role: 'menu', hidden: true },
      MORE_LINKS.map(([label, href]) =>
        h('a', { class: 'bga-nav-row', role: 'menuitem', href, target: '_blank', rel: 'noopener' }, label),
      ),
    );
    const more = h(
      'button',
      { type: 'button', class: 'bga-nav-t bga-nav-i', title: t('更多'), 'aria-haspopup': 'menu', 'aria-expanded': 'false' },
      navIcon('dots'),
    );
    leftLinks.append(more);
    const foldLeft = h('button', { type: 'button', class: 'bga-nav-arrow' }, navIcon('chevron'));
    const leftTile = h('div', { class: 'bga-nav-tile bga-nav-left' }, home, leftLinks, foldLeft);

    const input = h('input', {
      class: 'bga-nav-input',
      type: 'search',
      name: 'keyword',
      autocomplete: 'off',
      maxlength: '100',
      placeholder: t('搜尋影片、UP 主'),
      'aria-label': t('搜尋'),
    });
    if (PAGE.search) input.value = new URLSearchParams(location.search).get('keyword') || '';
    const suggest = h('div', { class: 'bga-nav-pop bga-nav-suggest', role: 'listbox', hidden: true });
    const searchForm = h(
      'form',
      { class: 'bga-nav-tile bga-nav-search', role: 'search' },
      input,
      h('button', { type: 'submit', class: 'bga-nav-t bga-nav-i', title: t('搜尋') }, navIcon('search')),
      suggest,
    );
    const search = (keyword) => {
      const words = String(keyword || '').trim();
      if (!words) return void input.focus();
      const target = `https://search.bilibili.com/all?keyword=${encodeURIComponent(words)}`;

      if (PAGE.search) location.assign(target);
      else window.open(target, '_blank', 'noopener');
      suggest.hidden = true;
    };

    const entryLinks = {};
    const rightLinks = h('div', { class: 'bga-nav-fold' });
    for (const [name, label, icon, href] of NAV_ENTRIES) {
      const badge = h('b', { class: `bga-nav-badge${name === 'dynamic' ? ' bga-nav-dot' : ''}`, hidden: true });
      const link = h(
        'a',
        { class: 'bga-nav-t bga-nav-i', href: href || SPACE, 'aria-label': label, target: '_blank', rel: 'noopener' },
        navIcon(icon),
        badge,
      );
      entryLinks[name] = { link, badge };
      rightLinks.append(link);
      watch(`x.nav.${name}`, (on) => (link.hidden = !on));
    }
    const face = h('img', { class: 'bga-nav-face', alt: '', decoding: 'async', hidden: true });
    const avatar = h(
      'button',
      { type: 'button', class: 'bga-nav-t bga-nav-i bga-nav-me', 'aria-haspopup': 'dialog', 'aria-expanded': 'false' },
      face,
      h('span', { class: 'bga-nav-login' }, t('登入')),
      h('b', { class: 'bga-nav-badge bga-nav-dot', hidden: true }),
    );
    const foldRight = h('button', { type: 'button', class: 'bga-nav-arrow' }, navIcon('chevron'));
    const rightTile = h('div', { class: 'bga-nav-tile bga-nav-right' }, foldRight, rightLinks, avatar);

    const card = h('div', { class: 'bga-nav-pop bga-nav-card', role: 'dialog', 'aria-label': t('個人卡片'), hidden: true });
    const peek = h('div', { class: 'bga-nav-pop bga-nav-peek', hidden: true });

    const bar = h('nav', { class: 'bga-nav', 'aria-label': t('導航欄') }, leftTile, searchForm, rightTile, menu, card, peek);

    const FOLDS = [
      { key: 'x.nav.leftClosed', button: foldLeft, tile: leftTile },
      { key: 'x.nav.rightClosed', button: foldRight, tile: rightTile },
    ];
    for (const fold of FOLDS) {
      const apply = (closed) => {
        fold.tile.classList.toggle('bga-closed', !!closed);
        fold.button.title = closed ? t('展開') : t('收起');
        fold.button.setAttribute('aria-expanded', String(!closed));
      };
      apply(store.get(fold.key));
      store.on(fold.key, apply);
      fold.button.addEventListener('click', () => {
        closePops();
        store.set(fold.key, !store.get(fold.key));
      });
    }

    const POPS = [
      { pop: menu, trigger: more },
      { pop: card, trigger: avatar },
    ];
    const setPop = (target, open) => {
      for (const { pop, trigger } of POPS) {
        const show = pop === target && open;
        pop.hidden = !show;
        trigger.setAttribute('aria-expanded', String(show));
      }
      if (open) {
        closePeek();
        suggest.hidden = true;
        syncDirection();
      }
    };
    const closePops = () => setPop(null, false);
    more.addEventListener('click', (event) => {
      event.stopPropagation();
      setPop(menu, menu.hidden);
    });
    document.addEventListener('click', (event) => {
      if (!menu.hidden && !menu.contains(event.target)) closePops();
      else if (!card.hidden && !card.contains(event.target) && !avatar.contains(event.target)) closePops();
      if (!searchForm.contains(event.target)) suggest.hidden = true;
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      closePops();
      closePeek();
    });

    const ACCOUNT_KEY = 'x.nav.account';
    const ACCOUNT_TTL = 60000;
    let account = null;
    const unread = { message: 0, dynamic: 0, parts: null };
    const setBadge = (badge, count) => {
      badge.hidden = !count;
      badge.textContent = badge.classList.contains('bga-nav-dot') ? '' : count > 99 ? '99+' : String(count || '');
    };

    const countUp = (node, value) => {
      const show = (current) => (node.textContent = COMPACT_NUMBER.format(current));
      if (CALM.matches || value < 2) return void show(value);
      const begin = performance.now();
      const step = (now) => {
        const progress = Math.min(1, (now - begin) / 650);
        show(Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress < 1 && node.isConnected) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const isDark = () => /(?:^|;\s*)theme_style=dark(?:;|$)/.test(document.cookie);
    const switchTheme = () => {
      document.cookie = `theme_style=${isDark() ? 'light' : 'dark'}; domain=.bilibili.com; path=/; max-age=31536000`;
      location.reload();
    };
    const themeButton = () => {
      const dark = isDark();
      return h(
        'button',
        { type: 'button', class: 'bga-nav-act', onclick: switchTheme, title: t('切換後會重新載入頁面') },
        navIcon(dark ? 'moon' : 'sun'),
        dark ? t('深色') : t('淺色'),
      );
    };

    const logoutButton = () => {
      const label = h('span', {}, t('登出'));
      let armed = 0;
      const button = h('button', { type: 'button', class: 'bga-nav-act' }, navIcon('logout'), label);
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        if (!armed) {
          button.classList.add('bga-hot');
          label.textContent = t('再按一次確認');
          armed = setTimeout(() => {
            armed = 0;
            button.classList.remove('bga-hot');
            label.textContent = t('登出');
          }, 3000);
          return;
        }
        clearTimeout(armed);
        const token = document.cookie.match(/(?:^|;\s*)bili_jct=([0-9a-f]+)/)?.[1] || '';
        store.del(ACCOUNT_KEY);
        const form = h(
          'form',
          { method: 'post', action: 'https://passport.bilibili.com/login/exit/v2', hidden: true },
          h('input', { type: 'hidden', name: 'biliCSRF', value: token }),
          h('input', { type: 'hidden', name: 'gourl', value: location.href }),
        );
        document.body.append(form);
        form.submit();
      });
      return button;
    };

    const cardRow = (icon, label, href, note, hot) =>
      h(
        'a',
        { class: 'bga-nav-row', href, target: '_blank', rel: 'noopener' },
        navIcon(icon),
        h('span', { class: 'bga-nav-label' }, label),
        note ? h('span', { class: `bga-nav-note${hot ? ' bga-hot' : ''}` }, note) : null,
      );
    const renderCard = () => {
      if (!account || card.hidden) return;
      const { name, mid, level, exp, next, coins, bcoin, vip, stat } = account;
      const space = `${SPACE}${mid}`;
      const full = !Number.isFinite(next) || next <= exp;

      const later = Number.isFinite(account.later)
        ? h(
            'a',
            { href: 'https://www.bilibili.com/watchlater/', target: '_blank', rel: 'noopener', onclick: (event) => event.stopPropagation() },
            t`稍後再看 ${account.later}`,
          )
        : '';
      const figure = (value, label, href) => {
        const figureNode = h('b', {}, '–');
        if (stat) countUp(figureNode, value);
        return h('a', { class: 'bga-nav-stat', href, target: '_blank', rel: 'noopener' }, figureNode, h('span', {}, label));
      };
      card.replaceChildren(
        h(
          'div',
          { class: 'bga-nav-head' },
          h(
            'a',
            { class: 'bga-nav-id', href: space, target: '_blank', rel: 'noopener' },
            h('img', { class: 'bga-nav-face', alt: '', src: picture(account.face, 128) || null }),
            h(
              'span',
              { class: 'bga-nav-who' },
              h('b', {}, name),
              h('span', {}, [`LV${level}`, vip, t`硬幣 ${coins}`, t`B幣 ${bcoin}`].filter(Boolean).join(' · ')),
            ),
          ),

          h('button', {
            type: 'button',
            class: 'bga-nav-duo',
            title: t`${PRODUCT} 設定`,
            'aria-label': t`${PRODUCT} 設定`,
            onclick: (event) => {
              event.stopPropagation();
              closePops();

              setTimeout(() => panelToggle?.(), 0);
            },
          }),
        ),
        h(
          'div',
          { class: 'bga-nav-level' },
          h('span', { class: 'bga-nav-track' }, h('i', { style: `width:${full ? 100 : Math.round((exp / next) * 100)}%` })),
          h('span', {}, full ? t('已滿級') : t`距 LV${level + 1} 還差 ${next - exp}`),
        ),
        h(
          'div',
          { class: 'bga-nav-stats' },
          figure(stat?.following, t('關注'), `${space}/fans/follow`),
          figure(stat?.follower, t('粉絲'), `${space}/fans/fans`),
          figure(stat?.dynamic, t('動態'), `${space}/dynamic`),
        ),
        h(
          'div',
          { class: 'bga-nav-list' },
          cardRow('user', t('個人空間'), space),
          cardRow('mail', t('消息'), 'https://message.bilibili.com/', unread.message ? t`${unread.message} 則未讀` : '', true),
          cardRow('windmill', t('動態'), 'https://t.bilibili.com/', unread.dynamic ? t('有更新') : '', true),
          cardRow('star', t('收藏'), `${space}/favlist`),
          cardRow('clock', t('歷史'), 'https://www.bilibili.com/history', later),
          cardRow('video', t('投稿管理'), 'https://member.bilibili.com/platform/upload-manager/article'),
        ),
        h('div', { class: 'bga-nav-foot' }, themeButton(), logoutButton()),
      );
    };
    const renderBar = () => {
      const source = account && picture(account.face, 96);
      if (source && face.getAttribute('src') !== source) face.src = source;
      face.hidden = !source;
      avatar.classList.toggle('bga-in', !!account);
      avatar.title = account ? account.name : t('登入');
      if (account) entryLinks.fav.link.href = `${SPACE}${account.mid}/favlist`;
      setBadge(entryLinks.message.badge, account ? unread.message : 0);
      setBadge(entryLinks.dynamic.badge, account && unread.dynamic ? 1 : 0);

      setBadge(avatar.querySelector('.bga-nav-dot'), account && (unread.message || unread.dynamic) ? 1 : 0);
    };

    const loadStat = async () => {
      if (!account || account.stat) return;
      const stat = await cached('stat', 60000, () => api('https://api.bilibili.com/x/web-interface/nav/stat'));
      if (!account) return;
      account.stat = { following: number(stat?.following), follower: number(stat?.follower), dynamic: number(stat?.dynamic_count) };
      renderCard();
    };

    const loadLater = async () => {
      if (!account || Number.isFinite(account.later)) return;
      const list = await cached('later', 60000, () => api('https://api.bilibili.com/x/v2/history/toview'));
      if (!account) return;
      account.later = number(list?.count);
      renderCard();
    };
    avatar.addEventListener('click', async (event) => {
      event.stopPropagation();

      if (!account && !settled) await loadAccount().catch((error) => warn('导航栏：账号信息', error));

      if (!account && !settled) return;
      if (!account) return void location.assign(`https://passport.bilibili.com/login?gourl=${encodeURIComponent(location.href)}`);
      setPop(card, card.hidden);
      if (card.hidden) return;
      renderCard();
      loadStat().catch((error) => warn('导航栏：关注数', error));
      loadLater().catch((error) => warn('导航栏：稍后再看', error));
    });

    let settled = false;

    let asking = null;
    const loadAccount = () => (asking ||= askAccount().finally(() => (asking = null)));
    const askAccount = async () => {
      const reply = await dm.getJSON('https://api.bilibili.com/x/web-interface/nav');
      const info = reply?.data;

      if (reply?.code !== 0 && reply?.code !== -101) throw new Error(`nav code ${reply?.code}`);
      settled = true;
      avatar.classList.add('bga-known');
      if (!info?.isLogin) {
        account = null;
        store.del(ACCOUNT_KEY);
        return void renderBar();
      }
      account = {
        name: String(info.uname || ''),
        mid: number(info.mid),
        face: info.face,
        level: number(info.level_info?.current_level),
        exp: number(info.level_info?.current_exp),
        next: Number(info.level_info?.next_exp),
        coins: number(info.money),
        bcoin: number(info.wallet?.bcoin_balance),
        vip: info.vipStatus ? String(info.vip_label?.text || '') : '',
        stat: account?.stat || null,
      };
      store.set(ACCOUNT_KEY, { time: Date.now(), data: { ...account, stat: null } });
      renderBar();
      renderCard();
    };
    const loadUnread = async () => {
      if (!account || document.hidden) return;
      const counts = await Promise.allSettled([
        dm.getJSON('https://api.bilibili.com/x/msgfeed/unread'),
        dm.getJSON('https://api.vc.bilibili.com/session_svr/v1/session_svr/single_unread'),
        dm.getJSON('https://api.bilibili.com/x/web-interface/dynamic/entrance'),
      ]);
      const [feed, chat, entrance] = counts.map((result) => (result.status === 'fulfilled' ? result.value?.data : null));
      unread.parts = {
        reply: number(feed?.reply),
        at: number(feed?.at),
        like: number(feed?.like),
        system: number(feed?.sys_msg),
        chat: number(chat?.follow_unread) + number(chat?.unfollow_unread),
      };
      unread.message = Object.values(unread.parts).reduce((sum, count) => sum + count, 0) + number(feed?.up);
      unread.dynamic = number(entrance?.update_info?.item?.count);
      renderBar();
      renderCard();
    };

    const remembered = store.get(ACCOUNT_KEY);
    if (remembered?.data?.mid) {
      account = { ...remembered.data, stat: null };
      renderBar();
    }
    whenIdle(() => {
      const recent = remembered?.data?.mid && Date.now() - number(remembered.time) < ACCOUNT_TTL;
      Promise.resolve(recent ? null : loadAccount())
        .then(loadUnread)
        .catch((error) => warn('导航栏：账号信息', error));
    });
    setInterval(() => loadUnread().catch(() => {}), 120000);

    const mediaRow = ({ href, cover, title, note }) =>
      h(
        'a',
        { class: 'bga-nav-media', href, target: '_blank', rel: 'noopener', title },
        h('img', { class: 'bga-nav-cover', alt: '', loading: 'lazy', decoding: 'async', src: picture(cover, 192, 120) || null }),
        h('span', { class: 'bga-nav-text' }, h('b', {}, title), h('span', {}, note)),
      );
    const clock = (seconds) => {
      const total = Math.max(0, Math.round(number(seconds)));
      return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
    };
    const video = (bvid) => `https://www.bilibili.com/video/${encodeURIComponent(bvid)}/`;
    const PEEKS = {
      message: {
        title: t('消息'),
        more: 'https://message.bilibili.com/',
        async rows() {
          const parts = unread.parts || {};
          return [
            [t('回覆我的'), 'reply', 'https://message.bilibili.com/#/reply'],
            [t('@ 我的'), 'at', 'https://message.bilibili.com/#/at'],
            [t('收到的讚'), 'like', 'https://message.bilibili.com/#/love'],
            [t('系統通知'), 'system', 'https://message.bilibili.com/#/system'],
            [t('我的訊息'), 'chat', 'https://message.bilibili.com/#/whisper'],
          ].map(([label, key, href]) => cardRow('mail', label, href, parts[key] ? String(parts[key]) : '', true));
        },
      },
      dynamic: {
        title: t('動態'),
        more: 'https://t.bilibili.com/',
        async rows() {
          const feed = await cached('dynamic', 60000, () =>
            api('https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all?type=video&page=1'),
          );
          return (feed?.items || []).slice(0, 8).flatMap((item) => {
            const archive = item?.modules?.module_dynamic?.major?.archive;
            const author = item?.modules?.module_author;
            if (!archive?.title) return [];
            return mediaRow({
              href: safeLink(archive.jump_url, archive.bvid ? video(archive.bvid) : 'https://t.bilibili.com/'),
              cover: archive.cover,
              title: String(archive.title),
              note: [author?.name, author?.pub_time, archive.duration_text].filter(Boolean).join(' · '),
            });
          });
        },
      },
      fav: {
        title: t('收藏'),
        more: () => `${SPACE}${account.mid}/favlist`,
        async rows() {
          const folders = await cached('folders', 300000, () =>
            api(`https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=${account.mid}`),
          );
          const folder = folders?.list?.[0];
          if (!folder?.id) return [];
          const list = await cached('fav', 60000, () =>
            api(`https://api.bilibili.com/x/v3/fav/resource/list?media_id=${number(folder.id)}&ps=8&pn=1&platform=web`),
          );
          return (list?.medias || []).slice(0, 8).flatMap((media) =>
            media?.bvid
              ? mediaRow({
                  href: video(media.bvid),
                  cover: media.cover,
                  title: String(media.title || ''),
                  note: [media.upper?.name, clock(media.duration)].filter(Boolean).join(' · '),
                })
              : [],
          );
        },
      },
      history: {
        title: t('歷史'),
        more: 'https://www.bilibili.com/history',
        async rows() {
          const list = await cached('history', 60000, () =>
            api('https://api.bilibili.com/x/web-interface/history/cursor?ps=8&type=archive'),
          );
          return (list?.list || []).slice(0, 8).flatMap((entry) => {
            const bvid = entry?.history?.bvid;
            if (!bvid) return [];
            const watched = number(entry.progress) < 0 ? t('已看完') : `${clock(entry.progress)} / ${clock(entry.duration)}`;
            return mediaRow({
              href: video(bvid),
              cover: entry.cover,
              title: String(entry.title || ''),
              note: [entry.author_name, watched].filter(Boolean).join(' · '),
            });
          });
        },
      },
    };
    let peekName = '';
    let peekTimer = 0;
    const closePeek = () => {
      clearTimeout(peekTimer);
      peekName = '';
      peek.hidden = true;
    };
    const openPeek = async (name) => {
      if (!account || !val('x.nav.peek') || peekName === name) return;
      closePops();
      suggest.hidden = true;
      peekName = name;
      const view = PEEKS[name];
      const body = h('div', { class: 'bga-nav-peek-body' }, [1, 2, 3].map(() => h('div', { class: 'bga-nav-ghost' })));
      const more = typeof view.more === 'function' ? view.more() : view.more;
      peek.replaceChildren(
        h(
          'div',
          { class: 'bga-nav-peek-head' },
          h('b', {}, view.title),
          h('a', { href: more, target: '_blank', rel: 'noopener' }, t('看全部')),
        ),
        body,
      );

      const box = entryLinks[name].link.getBoundingClientRect();
      const frame = bar.getBoundingClientRect();
      peek.style.right = `${Math.max(16, Math.round(frame.right - box.right - 150))}px`;
      peek.hidden = false;
      syncDirection();
      try {
        const rows = await view.rows();
        if (peekName !== name) return;
        body.replaceChildren(...(rows.length ? rows : [h('p', { class: 'bga-nav-empty' }, t('沒有內容'))]));
      } catch (error) {
        warn(`导航栏：${name} 预览`, error);
        if (peekName === name) body.replaceChildren(h('p', { class: 'bga-nav-empty' }, t('載入失敗')));
      }
    };
    const schedule = (run, delay) => {
      clearTimeout(peekTimer);
      peekTimer = setTimeout(run, delay);
    };
    for (const [name] of NAV_ENTRIES) {
      const { link } = entryLinks[name];
      link.addEventListener('pointerenter', () => schedule(() => openPeek(name), 180));
      link.addEventListener('pointerleave', () => schedule(closePeek, 260));
      link.addEventListener('focus', () => schedule(() => openPeek(name), 0));
    }
    peek.addEventListener('pointerenter', () => clearTimeout(peekTimer));
    peek.addEventListener('pointerleave', () => schedule(closePeek, 260));

    let suggestRun = 0;
    let picked = -1;
    const suggestRows = () => [...suggest.querySelectorAll('.bga-nav-row')];
    const showSuggest = (title, words, ranked) => {
      picked = -1;
      if (!words.length) return void (suggest.hidden = true);

      suggest.classList.toggle('bga-two', ranked);
      suggest.replaceChildren(
        ...(title ? [h('div', { class: 'bga-nav-peek-head' }, h('b', {}, title))] : []),
        ...words.map((word, index) =>
          h(
            'button',
            { type: 'button', class: 'bga-nav-row', role: 'option', tabindex: '-1', dataset: { word } },
            ranked ? h('i', { class: `bga-nav-rank${index < 3 ? ' bga-hot' : ''}` }, String(index + 1)) : navIcon('search'),
            h('span', { class: 'bga-nav-label' }, word),
          ),
        ),
      );
      suggest.hidden = false;
      syncDirection();
    };
    const loadSuggest = async () => {
      const run = ++suggestRun;
      const term = input.value.trim();
      try {
        if (!term) {
          const square = await cached('hot', 300000, () => api('https://api.bilibili.com/x/web-interface/search/square?limit=10'));
          if (run !== suggestRun || document.activeElement !== input) return;
          const words = (square?.trending?.list || []).map((entry) => String(entry?.show_name || entry?.keyword || '')).filter(Boolean);
          return void showSuggest(t('熱搜'), words.slice(0, 10), true);
        }

        const result = await cached(`suggest:${term}`, 60000, () =>
          api(`https://api.bilibili.com/x/web-interface/suggest?highlight=0&term=${encodeURIComponent(term)}`),
        );
        if (run !== suggestRun || document.activeElement !== input) return;
        const tags = result?.result?.tag || result?.tag || [];
        showSuggest('', tags.map((entry) => String(entry?.value || '')).filter(Boolean).slice(0, 10), false);
      } catch (error) {
        if (run === suggestRun) suggest.hidden = true;
      }
    };
    let suggestTimer = 0;
    input.addEventListener('focus', loadSuggest);

    input.addEventListener('blur', () => setTimeout(() => document.activeElement === input || (suggest.hidden = true), 160));
    input.addEventListener('input', () => {
      clearTimeout(suggestTimer);
      suggestTimer = setTimeout(loadSuggest, 160);
    });
    input.addEventListener('keydown', (event) => {
      event.stopPropagation();
      const rows = suggest.hidden ? [] : suggestRows();
      if (event.key === 'Escape') return void (suggest.hidden ? input.blur() : (suggest.hidden = true));
      if (!rows.length || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return;
      event.preventDefault();
      picked = (picked + (event.key === 'ArrowDown' ? 1 : -1) + rows.length + (picked < 0 && event.key === 'ArrowUp' ? 1 : 0)) % rows.length;
      rows.forEach((row, index) => row.classList.toggle('bga-on', index === picked));
      input.value = rows[picked].dataset.word;
    });
    for (const type of ['keyup', 'keypress']) input.addEventListener(type, (event) => event.stopPropagation());
    suggest.addEventListener('mousedown', (event) => event.preventDefault());
    suggest.addEventListener('click', (event) => {
      const row = event.target.closest('.bga-nav-row');
      if (!row) return;
      input.value = row.dataset.word;
      search(row.dataset.word);
    });
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      search(input.value);
    });
    searchForm.addEventListener('click', (event) => event.target === searchForm && input.focus());

    let glowQueued = false;
    bar.addEventListener(
      'pointermove',
      (event) => {
        if (glowQueued || CALM.matches) return;
        const tile = event.target.closest?.('.bga-nav-tile');
        if (!tile) return;
        glowQueued = true;
        requestAnimationFrame(() => {
          glowQueued = false;
          const box = tile.getBoundingClientRect();
          tile.style.setProperty('--bga-mx', `${Math.round(event.clientX - box.left)}px`);
          tile.style.setProperty('--bga-my', `${Math.round(event.clientY - box.top)}px`);
        });
      },
      { passive: true },
    );

    const syncDirection = () => bar.classList.toggle('bga-up', bar.getBoundingClientRect().top > window.innerHeight * 0.5);

    const syncTop = () => flag('nav-clear', PAGE.home && window.scrollY < 72);
    let scrollQueued = false;
    window.addEventListener(
      'scroll',
      () => {
        if (scrollQueued) return;
        scrollQueued = true;
        requestAnimationFrame(() => {
          scrollQueued = false;
          syncDirection();
          syncTop();
        });
      },
      { passive: true },
    );

    const NATIVE_BARS = '.bili-header, .link-navbar, #biliMainHeader, #bili-header-container, #internationalHeader';
    let retired = false;
    const mount = () => {
      if (retired) return;
      if (bar.parentElement !== document.body || document.body.firstElementChild !== bar) document.body.prepend(bar);
      syncDirection();
      syncTop();
    };
    bodyReady().then(() => {
      mount();

      setInterval(() => document.hidden || mount(), 2000);

      setTimeout(() => {
        if (document.querySelector(NATIVE_BARS)) return;
        retired = true;
        bar.remove();
        flag('nav-own', false);
      }, 6000);
    });
  }

  defOpt('x.pod', true, {
    tab: 'video',
    group: '選集',
    label: '選集浮層',
    hint: '點控制欄的「选集」，合集 / 分 P 清單直接浮在播放器右側，不用往下捲；全螢幕下也一樣。再點一次收起',
  });
  defOpt('x.pod.autoClose', true, { tab: 'video', group: '選集', label: '選好一集後自動收起' });
  defOpt('x.pod.thumb', false, {
    tab: 'video',
    group: '選集',
    label: t('選集顯示縮圖'),
    hint: t('合集顯示每一集的封面，分 P 影片每一段都顯示影片的主封面；捲到哪裡才載入哪裡'),
  });
  defOpt('x.pod.width', 380, { tab: 'video', group: '選集', label: '浮層寬度', unit: 'px', step: 20 });

  function setupPod(container) {
    const pagePod = () => [...document.querySelectorAll('.video-pod')].find((el) => !el.closest('.bga-pod-fs')) || null;

    const centerCurrent = (pod) => {
      const body = pod?.querySelector('.video-pod__body');
      const current = body?.querySelector('.active, [class*="item-active"], .on');
      if (!body || !current) return 0;
      const offset = current.getBoundingClientRect().top - body.getBoundingClientRect().top;
      const delta = offset - (body.clientHeight - current.offsetHeight) / 2;
      const before = body.scrollTop;
      body.style.scrollBehavior = 'auto';
      body.scrollTop = before + delta;
      return body.scrollTop === before ? 0 : delta;
    };
    const centerSoon = (getPod, tries = 10) =>
      requestAnimationFrame(() => {
        if (Math.abs(centerCurrent(getPod())) > 4 && tries > 0) setTimeout(() => centerSoon(getPod, tries - 1), 60);
      });

    const thumbRules = h('style', { class: 'bga-pod-thumbs' });
    const thumbDone = new Set();
    let thumbSource = { bvid: '', urls: new Map() };

    const thumbUrls = () => {
      const data = W.__INITIAL_STATE__?.videoData;
      if (!data || data.bvid === thumbSource.bvid) return thumbSource.urls;
      const urls = new Map();
      for (const section of data.ugc_season?.sections || []) {
        for (const episode of section.episodes || []) {
          if (episode.bvid && episode.arc?.pic) urls.set(String(episode.bvid), episode.arc.pic);
        }
      }

      for (const page of data.pages || []) {
        if (page.cid && data.pic) urls.set(String(page.cid), data.pic);
      }
      thumbSource = { bvid: data.bvid, urls };
      return urls;
    };
    const addThumb = (item) => {
      const key = item.dataset.key;
      if (!key || thumbDone.has(key)) return;
      const address = String(thumbUrls().get(key) || '').replace(/^(https?:)?\/\//, 'https://');

      if (!/^https:\/\/[\w.-]+\.hdslb\.com\/[\w./-]+$/.test(address)) return;
      thumbDone.add(key);
      thumbRules.append(`[data-key="${key.replace(/[^\w-]/g, '')}"]{--bga-thumb:url("${address}@192w_120h_1c.webp")}\n`);
    };
    const thumbWatcher = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        addThumb(entry.target);
        thumbWatcher.unobserve(entry.target);
      }
    });

    const watchThumbs = () => {
      if (!val('x.pod.thumb')) return;
      if (!thumbRules.isConnected) document.head.append(thumbRules);
      for (const item of document.querySelectorAll('.video-pod__body [data-key]')) {
        if (!thumbDone.has(item.dataset.key)) thumbWatcher.observe(item);
      }
    };
    watch('x.pod.thumb', (on) => {
      flag('pod-thumb', !!on);
      watchThumbs();
    });

    let copyHost = null;
    const closeCopy = () => {
      copyHost?.remove();
      copyHost = null;
    };

    const originalOf = (clicked) => {
      const copy = copyHost.firstElementChild;
      const path = [];
      for (let node = clicked; node && node !== copy; node = node.parentElement) {
        path.unshift([...node.parentElement.children].indexOf(node));
      }
      let target = pagePod();
      for (const index of path) target = target?.children[index];
      return target;
    };
    const onCopyClick = (event) => {
      event.stopPropagation();
      const target = originalOf(event.target);
      if (!target) return;
      try {
        if (typeof target.click === 'function') target.click();
        else target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      } catch {
      }
      const pickedEpisode = event.target.closest('.video-pod__body [class*="item"]') && !event.target.closest('button');
      if (pickedEpisode && val('x.pod.autoClose')) setTimeout(closeCopy, 180);
      else setTimeout(() => copyHost && renderCopy(), 350);
    };
    const renderCopy = () => {
      const source = pagePod();
      if (!source) return closeCopy();
      const scrollTop = copyHost?.querySelector('.video-pod__body')?.scrollTop;
      if (!copyHost) {
        copyHost = h('div', { class: 'bga-pod-fs' });
        copyHost.addEventListener('click', onCopyClick);

        for (const type of ['wheel', 'mousedown', 'mouseup', 'dblclick', 'contextmenu', 'keydown']) {
          copyHost.addEventListener(type, (event) => event.stopPropagation());
        }
        container.appendChild(copyHost);
      }
      copyHost.replaceChildren(source.cloneNode(true));
      const body = copyHost.querySelector('.video-pod__body');
      if (body && scrollTop != null) body.scrollTop = scrollTop;
      else centerSoon(() => copyHost);
      watchThumbs();
    };

    const isOpen = () => (fullscreenElement() ? !!copyHost : hasFlag('pod-open'));
    const setOpen = (open) => {
      if (open && !(val('x.pod') && pagePod())) return;
      if (fullscreenElement()) {
        flag('pod-open', false);
        return open ? renderCopy() : closeCopy();
      }
      closeCopy();
      flag('pod-open', open);
      if (open) {
        watchThumbs();
        centerSoon(pagePod);
      }
    };

    watch('x.pod', (on) => {
      flag('pod', !!on);
      if (!on) setOpen(false);
    });
    watch('x.pod.width', (width) => setRootVar('--bga-pod-width', `${Math.max(240, width)}px`));

    container.addEventListener(
      'click',
      (event) => {
        const button = event.target.closest?.('.bpx-player-ctrl-eplist, .bga-pod-btn');
        if (!button || !val('x.pod') || !pagePod() || event.target.closest('.bpx-player-ctrl-eplist-menu-wrap')) return;
        event.stopPropagation();
        setOpen(!isOpen());
      },
      true,
    );
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) setOpen(false);
    });

    document.addEventListener(
      'click',
      (event) => {
        if (!hasFlag('pod-open') || !val('x.pod.autoClose')) return;
        const episode = event.target.closest?.('.video-pod__body [class*="item"]');
        if (episode && !event.target.closest('button, .video-pod__header')) setTimeout(() => setOpen(false), 180);
      },
      true,
    );

    window.addEventListener(
      'scroll',
      () => {
        if (hasFlag('pod-open') && window.scrollY > container.offsetHeight * 0.6) setOpen(false);
      },
      { passive: true },
    );

    for (const type of ['fullscreenchange', 'webkitfullscreenchange']) {
      document.addEventListener(type, () => {
        closeCopy();
        flag('pod-open', false);
      });
    }

    const syncButton = () => {
      if (document.hidden) return;
      const group = container.querySelector('.bpx-player-control-bottom-right');
      if (!group) return;
      const native = group.querySelector('.bpx-player-ctrl-eplist');
      const mine = group.querySelector('.bga-pod-btn');
      const nativeVisible = native && getComputedStyle(native).display !== 'none';
      const needed = val('x.pod') && pagePod() && !nativeVisible;
      if (needed && !mine) {
        group.prepend(
          h('div', { class: 'bpx-player-ctrl-btn bga-pod-btn', role: 'button', 'aria-label': '选集' }, '选集'),
        );
      } else if (!needed && mine) {
        mine.remove();
      }
      if (isOpen() && !pagePod()) setOpen(false);
      watchThumbs();
    };
    syncButton();
    setInterval(syncButton, 2500);
  }

  defOpt('x.font', true, {
    tab: 'general',
    group: t('字體'),
    label: t('使用系統字體'),
    hint: t('Mac 上用蘋方 / San Francisco，Windows 上用微軟雅黑，並開啟字體平滑'),
  });
  defOpt('x.tabularNums', true, {
    tab: 'general',
    group: t('字體'),
    label: t('等寬數字'),
    hint: t('播放時間、播放量等數字等寬顯示，跳動時不抖動'),
  });

  const isHarmonyFontSheet = (node) => node.localName === 'link' && /\/jinkela\/long\/font\//.test(node.href || '');

  function setupTypography() {
    reflect('x.font', 'font');
    reflect('x.tabularNums', 'tabular');
    const setFontFaces = toggleStyle(STYLES.fontface, 'fontface');
    watch('x.font', (on) => setFontFaces(!!on));
    if (!val('x.font')) return;

    const removeSheets = (nodes) => {
      for (const node of nodes) {
        if (node.nodeType === Node.ELEMENT_NODE && isHarmonyFontSheet(node)) node.remove();
      }
    };
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) removeSheets(mutation.addedNodes);
    });
    onRoot((root) => observer.observe(root, { childList: true, subtree: true }));
    ready().then(() => {
      removeSheets(document.querySelectorAll('link[href*="/jinkela/long/font/"]'));
      setTimeout(() => observer.disconnect(), 10000);
    });
  }

  if (IS_SAFARI) {
    defOpt('x.safari.liveText', false, {
      tab: 'video',
      group: 'Safari',
      label: t('全螢幕暫停時保留原況文字'),
      hint: t('開啟後可以在全螢幕暫停的畫面上框選文字，但暫停時右下角的按鈕（選集、小窗、退出全螢幕）會點不動'),
    });
  }

  function setupLiveTextGuard() {
    if (!IS_SAFARI) return;
    let decoy = null;

    const removeDecoy = () => {
      if (!decoy) return;
      try {
        decoy.srcObject?.getTracks().forEach((track) => track.stop());
      } catch {
      }
      decoy.remove();
      decoy = null;
    };

    const createDecoy = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2;
      canvas.height = 2;
      canvas.getContext('2d').fillRect(0, 0, 2, 2);

      const video = document.createElement('video');
      video.className = 'bga-fs-decoy';
      video.muted = true;
      video.playsInline = true;
      video.disablePictureInPicture = true;
      video.tabIndex = -1;
      video.setAttribute('aria-hidden', 'true');

      video.style.cssText = [
        'position:absolute!important',
        'left:-2px!important',
        'top:-2px!important',
        'width:calc(100% + 4px)!important',
        'height:calc(100% + 4px)!important',
        'opacity:0!important',
        'pointer-events:none!important',
        'z-index:-1!important',
      ].join(';');
      video.srcObject = canvas.captureStream();
      return video;
    };

    const sync = () => {
      const fullscreen = fullscreenElement();
      const wanted =
        fullscreen &&
        !val('x.safari.liveText') &&
        fullscreen.tagName !== 'VIDEO' &&
        fullscreen.querySelector('video:not(.bga-fs-decoy)');
      if (!wanted) return removeDecoy();
      if (decoy?.parentElement === fullscreen) return;
      removeDecoy();
      try {
        decoy = createDecoy();
        fullscreen.append(decoy);
        decoy.play()?.catch(() => {});
      } catch {
        removeDecoy();
      }
    };

    for (const type of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(type, sync, true);
    store.on('x.safari.liveText', sync);
  }

  function setupSearchRelayout() {
    if (!IS_SAFARI) return;
    const NUDGE_CLASS = 'bga-relayout';
    const BURST_MS = 6000;
    const nudge = () => {
      const input = document.querySelector('.nav-search-input');
      if (!input || document.activeElement === input) return;
      input.classList.add(NUDGE_CLASS);
      void input.offsetHeight;
      input.classList.remove(NUDGE_CLASS);
    };
    let burstUntil = 0;
    let running = false;
    const frame = () => {
      nudge();
      if (performance.now() < burstUntil) requestAnimationFrame(frame);
      else running = false;
    };
    const burst = () => {
      burstUntil = performance.now() + BURST_MS;
      if (running) return;
      running = true;
      requestAnimationFrame(frame);
    };
    burst();
    for (const type of ['DOMContentLoaded', 'load', 'pageshow']) addEventListener(type, burst, true);
    document.addEventListener('visibilitychange', () => document.hidden || burst());

    document.addEventListener('load', (event) => event.target?.localName === 'link' && burst(), true);
    setInterval(nudge, 2000);
  }

  TABS.push(['clean', t('淨化')], ['live', t('直播')]);

  defOpt('x.noGray', true, { tab: 'clean', group: t('頁面'), label: t('去掉全站黑白濾鏡') });
  defOpt('x.noAds', true, {
    tab: 'clean',
    group: t('頁面'),
    label: t('隱藏廣告'),
    hint: t('首頁推廣卡片、播放頁右欄的廣告位與推廣卡片、「檢測到廣告攔截」提示'),
  });
  defOpt('x.noElec', true, {
    tab: 'clean',
    group: t('頁面'),
    label: t('跳過片尾充電名單'),
    hint: t('頁面載入完成後才清空名單，不一定每次都生效'),
    reload: true,
  });
  defOpt('x.articleCopy', true, { tab: 'clean', group: t('頁面'), label: t('專欄允許複製'), reload: true });
  defOpt('x.end.noRelated', false, {
    tab: 'clean',
    group: t('頁面'),
    label: t('片尾不顯示相關推薦'),
    hint: t('影片播完後那一排「相關推薦」影片；重播等按鈕還在'),
  });
  defOpt('x.cleanUrl', true, {
    tab: 'clean',
    group: t('隱私'),
    label: t('清理網址追蹤參數'),
    hint: t('spm_id_from、vd_source、share_* 等'),
    reload: true,
  });
  defOpt('x.noReport', true, {
    tab: 'clean',
    group: t('隱私'),
    label: t('攔截資料上報'),
    hint: t('data.bilibili.com / cm.bilibili.com、Sentry、瀏覽器指紋'),
    reload: true,
  });
  defOpt('x.noP2P', true, {
    tab: 'clean',
    group: t('播放'),
    label: t('停用 P2P CDN 與 WebRTC'),
    hint: t('不替 B站上傳流量；影片位址換回官方 CDN'),
    reload: true,
  });
  defOpt('x.fitMode', true, {
    tab: 'clean',
    group: t('播放'),
    label: t('播放器設定加入「裁切模式」'),
    hint: t('在播放器的齒輪選單裡，讓畫面填滿播放器'),
    reload: true,
  });

  const TRACKING_PARAMS = new Set([
    'vd_source',
    'from_source',
    'from_spmid',
    'spmid',
    'csource',
    'msource',
    'bsource',
    'trackid',
    'refer_from',
    'plat_id',
    'unique_k',
    'bbid',
    'buvid',
    'mid',
    'up_id',
    'timestamp',
    'session_id',
    'launch_id',
    'live_from',
    'is_story_h5',
    '-Arouter',
  ]);

  const TRACKING_PREFIXES = ['spm', 'share'];
  const isTrackingParam = (name) =>
    TRACKING_PARAMS.has(name) || TRACKING_PREFIXES.some((prefix) => name.startsWith(prefix));

  const cleanUrl = (address) => {
    if (!address) return address;
    let url;
    try {
      url = new URL(address, location.href);
    } catch {
      return address;
    }
    const tracked = [...url.searchParams.keys()].filter(isTrackingParam);
    if (!tracked.length) return address;
    for (const name of tracked) url.searchParams.delete(name);
    return url.toString();
  };

  const keepAddressBarClean = () => {
    const history = W.history;
    const nativeReplace = history.replaceState;
    for (const method of ['pushState', 'replaceState']) {
      const native = history[method];
      history[method] = function (state, title, url, ...rest) {
        return native.call(this, state, title, cleanUrl(url), ...rest);
      };
    }
    const cleaned = cleanUrl(location.href);
    if (cleaned !== location.href) safe(() => nativeReplace.call(history, history.state, '', cleaned), '清理地址栏');
  };

  const skipChargeList = () => {
    const clear = () => {
      const list = W.__INITIAL_STATE__?.elecFullInfo?.list;
      if (Array.isArray(list) && list.length) W.__INITIAL_STATE__.elecFullInfo.list = [];
    };
    const later = () => setTimeout(() => safe(clear, '充电名单'), 1500);
    if (document.readyState === 'complete') later();
    else window.addEventListener('load', later, { once: true });
  };

  const allowArticleCopy = () => {
    ready().then(() => {
      try {
        if (W.original) W.original.reprint = '1';
      } catch {
      }
      const article = document.querySelector('.article-holder, .opus-module-content');
      article?.classList.remove('unable-reprint');
      article?.addEventListener('copy', (event) => event.stopImmediatePropagation(), true);
    });
  };

  let fitCheckbox = null;
  const setVideoFit = (on) => {
    flag('video-fit', on);
    if (fitCheckbox) fitCheckbox.checked = on;
  };

  const toggleVideoFit = () => {
    setVideoFit(!hasFlag('video-fit'));
    return hasFlag('video-fit');
  };

  const addFitSwitch = () => {
    waitFor(() => document.querySelector('.bpx-player-ctrl-setting-menu-left'), '播放器设置菜单', 60000, 300)
      .then((menu) => {
        if (menu.querySelector('.bga-fit-switch')) return;

        const model = menu.querySelector('.bui-switch');
        if (!model) return;
        const item = model.cloneNode(true);
        item.className = 'bga-fit-switch bui bui-switch';

        const layout = getComputedStyle(model);
        for (const property of ['display', 'alignItems', 'width', 'height', 'lineHeight'])
          item.style[property] = layout[property];
        item.querySelector('.bui-switch-name').textContent = t('裁切模式');
        const input = item.querySelector('input');
        input.setAttribute('aria-label', t('裁切模式'));
        input.checked = hasFlag('video-fit');
        input.addEventListener('change', () => setVideoFit(input.checked));
        menu.insertBefore(item, menu.querySelector('.bpx-player-ctrl-setting-more'));
        fitCheckbox = input;

        const panel = menu.closest('.bui-panel-item');
        const rowHeight = parseFloat(layout.height) || 32;
        const panelHeight = parseFloat(panel?.style.height) || 140;
        setRootVar('--bga-setting-height', `${panelHeight + rowHeight}px`);
        if (panel) panel.style.height = '';
        flag('fit-switch', true);
      })
      .catch(() => {});
  };

  function setupClean() {
    reflect('x.noGray', 'no-gray');
    reflect('x.noAds', 'no-ads');
    reflect('x.end.noRelated', 'end-no-related');
    if (!IS_TOP) return;

    if (PAGE.www && val('x.noElec')) skipChargeList();
    if ((PAGE.read || PAGE.opus) && val('x.articleCopy')) allowArticleCopy();
    if (val('x.cleanUrl')) keepAddressBarClean();
    if ((PAGE.video || PAGE.bangumi) && val('x.fitMode')) addFitSwitch();
  }

  const pinGlobal = (name, value) => {
    try {
      delete W[name];
      Object.defineProperty(W, name, { get: () => value, set() {}, configurable: false });
    } catch {
    }
  };

  const blackhole = () => {
    const hole = new Proxy(function () {}, {
      get(_target, key) {
        if (key === 'then') return undefined;
        if (key === Symbol.toPrimitive) return () => '';
        return hole;
      },
      set: () => true,
      apply: () => hole,
      construct: () => hole,
    });
    return hole;
  };

  function blockReporting() {
    const REPORT_HOST = /(?:^|[/.])(?:data|cm)\.bilibili\.com/;
    hookFetch((url) => (REPORT_HOST.test(url) ? { block: 'hang' } : null));
    hookXHR((url) => (REPORT_HOST.test(url) ? { block: true } : null));
    safe(() => {
      W.navigator.sendBeacon = () => true;
    }, 'sendBeacon');

    const hole = blackhole();
    for (const name of ['MReporter', 'MReporterInstance', 'ReporterPb', 'ReporterPbInstance', 'Sentry'])
      pinGlobal(name, hole);

    pinGlobal('__biliUserFp__', { init() {}, queryUserLog: () => [] });
    pinGlobal('__USER_FP_CONFIG__', undefined);
    pinGlobal('__MIRROR_CONFIG__', undefined);
  }

  let uposHost = '';
  const officialHost = () => {
    uposHost ||= document.head?.innerHTML.match(/\bupos-[\w-]+\.bilivideo\.com/)?.[0] || '';
    return uposHost || 'upos-sz-mirrorcoso1.bilivideo.com';
  };

  const P2P_ROUTES = [

    { suffix: '.mcdn.bilivideo.cn', host: () => officialHost() },

    { suffix: '.szbdyd.com', host: (url) => url.searchParams.get('xy_usource') },
  ];

  const toOfficialCdn = (address) => {
    let url;
    try {
      url = new URL(address);
    } catch {
      return address;
    }
    const route = P2P_ROUTES.find(({ suffix }) => url.hostname.endsWith(suffix));
    const host = route?.host(url);
    if (!host) return address;
    url.host = host;
    url.port = '443';
    return url.toString();
  };

  const rewriteCdnUrls = (node, depth = 0) => {
    if (!node || typeof node !== 'object' || depth > 12) return;
    for (const key of Object.keys(node)) {
      const value = node[key];
      if (typeof value === 'string') {
        if (value.startsWith('http')) node[key] = toOfficialCdn(value);
      } else {
        rewriteCdnUrls(value, depth + 1);
      }
    }
  };

  function disableP2P() {
    class InertPeerConnection {
      addEventListener() {}
      createDataChannel() {}
      close() {}
    }
    class InertDataChannel {}
    pinGlobal('RTCPeerConnection', InertPeerConnection);
    pinGlobal('webkitRTCPeerConnection', InertPeerConnection);
    pinGlobal('RTCDataChannel', InertDataChannel);
    pinGlobal('webkitRTCDataChannel', InertDataChannel);

    pinGlobal('PCDNLoader', class {});
    pinGlobal(
      'BPP2PSDK',
      class {
        on() {}
      },
    );
    pinGlobal('SeederSDK', class {});

    if (!(PAGE.video || PAGE.bangumi)) return;

    onGlobal('__playinfo__', (info) => rewriteCdnUrls(info));
    hookXHR((url) => {
      const official = toOfficialCdn(url);
      return official === url ? null : { url: official };
    });
    safe(() => {
      const media = W.HTMLMediaElement.prototype;
      const native = Object.getOwnPropertyDescriptor(media, 'src');
      if (!native?.set) return;
      Object.defineProperty(media, 'src', {
        ...native,
        set(value) {
          native.set.call(this, typeof value === 'string' ? toOfficialCdn(value) : value);
        },
      });
    }, '影片地址');
  }

  function setupNetwork() {
    if (val('x.noReport')) blockReporting();
    if (val('x.noP2P')) disableP2P();
  }

  const WORD_LIST_HINT = t('每行一個詞；也可以寫 /正則/。B站標題多為簡體字，請用簡體輸入');

  defOpt('x.title.strip', '', {
    tab: 'clean',
    group: t('標題黨'),
    type: 'text',
    keep: true,
    label: t('從標題刪掉這些詞'),
    hint: t`影片照常顯示，只把這些詞從標題裡拿掉。${WORD_LIST_HINT}`,
    placeholder: '震惊\n全网首发\n/一口气看完.*/',
  });
  defOpt('x.title.hide', '', {
    tab: 'clean',
    group: t('標題黨'),
    type: 'text',
    keep: true,
    label: t('標題含有這些詞就隱藏影片'),
    hint: t`首頁、推薦、搜尋、排行榜、動態裡整張卡片不顯示；正在看的影片不受影響。${WORD_LIST_HINT}`,
    placeholder: t('盘点\n/第[一二三四五六七八九十]+期/'),
  });
  defOpt('x.title.calm', false, {
    tab: 'clean',
    group: t('標題黨'),
    label: t('收斂誇張標點'),
    hint: t('連續的驚嘆號、問號縮成一個（！！！→！）'),
  });

  const linesOf = (text) =>
    String(text || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

  const TITLE_PRESET = [
    '震惊',
    '炸裂',
    '封神',
    '杀疯了',
    '绝了',
    '逆天',
    '王炸',
    '泪目',
    '破防了',
    '看哭了',
    '惊呆了',
    '全程高能',
    '高能预警',
    '前方高能',
    '全网首发',
    '全网最全',
    '建议收藏',
    '一定要看',
    '万万没想到',
    '细思极恐',
    '太离谱了',
    '/史上最[^，。！？\\s]{1,6}/',
  ];

  ACTIONS.push({
    tab: 'clean',
    group: t('標題黨'),
    label: t('加入常見的標題黨用詞'),
    hint: t('把一組常見的誇張用詞加進「從標題刪掉這些詞」，之後可以自己增刪'),
    button: t('加入'),
    run() {
      const current = linesOf(val('x.title.strip'));
      const missing = TITLE_PRESET.filter((word) => !current.includes(word));
      if (!missing.length) return void toast(t('這些詞都已經在清單裡了'));
      store.set('x.title.strip', [...current, ...missing].join('\n'));
      toast(t`已加入 ${missing.length} 個詞`, 'ok');
    },
  });

  const parseWordList = (text) =>
    linesOf(text)
      .map((line) => {
        const regex = line.match(/^\/(.+)\/([a-z]*)$/);
        try {
          if (regex) {
            const flags = new Set(`${regex[2].replace(/[gy]/g, '')}g`);
            return new RegExp(regex[1], [...flags].join(''));
          }
          return new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        } catch {
          return null;
        }
      })
      .filter(Boolean);

  const matchesAny = (patterns, text) =>
    patterns.some((pattern) => {
      pattern.lastIndex = 0;
      return pattern.test(text);
    });

  function setupTitles() {
    if (!IS_TOP || !(PAGE.www || PAGE.search || PAGE.t || PAGE.space)) return;

    const TITLE_SELECTOR = [
      '.bili-video-card__info--tit',
      '.video-page-card-small .title',
      '.video-card .video-name',
      '.rank-item .info .title',
      '.bili-dyn-card-video__title',
      '.small-item .title',
      '.bpx-player-ending-related-item-title',
      '.video-page-operator-card-small .title',
      'h1.video-title',
    ].join(',');

    const CARD_SELECTORS = [
      '.feed-card',
      '.bili-feed-card',
      '.video-list-item',
      '.bili-dyn-list__item',
      '.video-page-card-small',
      '.video-page-operator-card-small',
      '.video-card',
      '.rank-item',
      '.small-item',
      '.bpx-player-ending-related-item',
      '.bili-video-card',
    ];

    let stripPatterns = [];
    let hidePatterns = [];
    let calmPunctuation = false;

    const rewrite = (title) => {
      let text = title;
      for (const pattern of stripPatterns) {
        pattern.lastIndex = 0;
        text = text.replace(pattern, '');
      }
      if (calmPunctuation) text = text.replace(/([!！])[!！]+/g, '$1').replace(/([?？])[?？]+/g, '$1');
      if (text === title) return title;

      text = text
        .replace(/【\s*】|\[\s*\]|（\s*）|\(\s*\)|「\s*」|《\s*》/g, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/^[\s，,、。:：|｜\-—·]+/, '')
        .trimEnd();

      return text.trim() ? text : title;
    };
    const rewriting = () => stripPatterns.length > 0 || calmPunctuation;

    const rewritten = new WeakMap();
    const originalOf = (node) => {
      const record = rewritten.get(node);
      return record && record.shown === node.nodeValue ? record.original : node.nodeValue;
    };
    const textNodesIn = (el) => {
      const nodes = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) nodes.push(walker.currentNode);
      return nodes;
    };

    const cardOf = (title) => {
      for (const selector of CARD_SELECTORS) {
        const card = title.closest(selector);
        if (!card) continue;

        const wrapper = card.parentElement;
        const isSoleChild = wrapper && wrapper !== document.body && wrapper.childElementCount === 1;
        return selector === '.bili-video-card' && isSoleChild ? wrapper : card;
      }
      return null;
    };

    const processTitle = (title) => {
      const nodes = textNodesIn(title);

      const fullTitle = nodes.map(originalOf).join('');
      if (hidePatterns.length && !title.matches('h1') && fullTitle.trim()) {
        const card = cardOf(title);
        const shouldHide = matchesAny(hidePatterns, fullTitle);
        if (card && shouldHide !== card.hasAttribute('data-bga-title-hidden'))
          card.toggleAttribute('data-bga-title-hidden', shouldHide);
      }

      for (const node of nodes) {
        const original = originalOf(node);
        const shown = rewriting() ? rewrite(original) : original;
        if (shown !== node.nodeValue) node.nodeValue = shown;
        if (shown !== original) rewritten.set(node, { original, shown });
        else rewritten.delete(node);
      }

      if (title.hasAttribute('title')) {
        const current = title.getAttribute('title');
        const remembered = title.dataset.bgaTitle;
        const original = remembered && rewrite(remembered) === current ? remembered : current;
        const shown = rewriting() ? rewrite(original) : original;
        if (shown !== current) {
          title.dataset.bgaTitle = original;
          title.setAttribute('title', shown);
        }
      }
    };

    let scanQueued = false;
    const scan = () => {
      scanQueued = false;
      if (!document.body) return;
      for (const title of document.querySelectorAll(TITLE_SELECTOR)) safe(() => processTitle(title), '标题屏蔽词');
    };
    const queueScan = () => {
      if (scanQueued) return;
      scanQueued = true;
      setTimeout(scan, 400);
    };

    let observer = null;
    let wasActive = false;
    const applySettings = () => {
      stripPatterns = parseWordList(val('x.title.strip'));
      hidePatterns = parseWordList(val('x.title.hide'));
      calmPunctuation = !!val('x.title.calm');
      const active = rewriting() || hidePatterns.length > 0;

      if (!hidePatterns.length) {
        for (const card of document.querySelectorAll('[data-bga-title-hidden]'))
          card.removeAttribute('data-bga-title-hidden');
      }
      if (active && !observer) {
        observer = pageObserver(queueScan);
        bodyReady().then(() => observer?.observe(document.body, { childList: true, subtree: true, characterData: true }));
      }
      if (!active && observer) {
        observer.disconnect();
        observer = null;
      }

      if (active || wasActive) bodyReady().then(scan);
      wasActive = active;
    };

    for (const key of ['x.title.strip', 'x.title.hide', 'x.title.calm']) store.on(key, applySettings);
    applySettings();
  }

  defOpt('x.feed.minView', 0, {
    tab: 'clean',
    group: t('首頁推薦過濾'),
    label: t('播放量低於這個數就隱藏'),
    hint: t('0 = 不限'),
    unit: t('次'),
    step: 1000,
  });
  defOpt('x.feed.minDur', 0, {
    tab: 'clean',
    group: t('首頁推薦過濾'),
    label: t('短於這個長度就隱藏'),
    hint: t('0 = 不限'),
    unit: t('秒'),
    step: 10,
  });
  defOpt('x.feed.maxDur', 0, {
    tab: 'clean',
    group: t('首頁推薦過濾'),
    label: t('長於這個長度就隱藏'),
    hint: t('0 = 不限'),
    unit: t('分'),
    step: 5,
  });
  defOpt('x.feed.maxAge', 0, {
    tab: 'clean',
    group: t('首頁推薦過濾'),
    label: t('發布超過這麼多天就隱藏'),
    hint: t('0 = 不限'),
    unit: t('天'),
    step: 30,
  });
  defOpt('x.feed.noPortrait', false, {
    tab: 'clean',
    group: t('首頁推薦過濾'),
    label: t('隱藏豎屏影片'),
    hint: t('要逐個查影片資料，卡片會晚一點才消失'),
  });
  defOpt('x.feed.keepFollowed', true, { tab: 'clean', group: t('首頁推薦過濾'), label: t('已關注的 UP 主不過濾') });
  defOpt('x.feed.ups', '', {
    tab: 'clean',
    group: t('首頁推薦過濾'),
    type: 'text',
    keep: true,
    label: t('隱藏這些 UP 主的影片'),
    hint: t('每行一個，寫 UP 主名稱或 UID'),
    placeholder: t('某某官方\n12345678'),
  });
  defOpt('x.cover.mode', 'off', {
    tab: 'clean',
    group: t('封面黨（激進）'),
    type: 'select',
    label: t('替換影片封面'),
    hint: t(
      '不顯示 UP 主上傳的封面，改用影片的第一幀或隨機一幀。每張卡片要多查一次資料，封面會晚一點才換；查得太多可能被 B站暫時限流。封面工具列的保存 / 放大仍是原封面',
    ),
    choices: [
      ['off', t('關')],
      ['first', t('第一幀')],
      ['random', t('隨機一幀')],
    ],
  });

  const FEED_OPTION_KEYS = [
    'x.feed.minView',
    'x.feed.minDur',
    'x.feed.maxDur',
    'x.feed.maxAge',
    'x.feed.noPortrait',
    'x.feed.keepFollowed',
    'x.feed.ups',
    'x.cover.mode',
  ];

  const videoInfo = (() => {
    const MAX_PARALLEL = 3;
    const cache = new Map();
    const waiting = [];
    let running = 0;

    const fetchInfo = async (bvid) => {
      try {
        const result = await dm.getJSON(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
        if (result?.code !== 0) return null;

        return { dimension: result.data.dimension, firstFrame: result.data.pages?.[0]?.first_frame || '' };
      } catch {
        return null;
      }
    };
    const pump = () => {
      while (running < MAX_PARALLEL && waiting.length) {
        const [bvid, resolve] = waiting.shift();
        running += 1;
        fetchInfo(bvid).then((info) => {
          running -= 1;
          if (!info) cache.delete(bvid);
          resolve(info);
          setTimeout(pump, 150);
        });
      }
    };

    return (bvid) => {
      if (!cache.has(bvid)) {
        cache.set(
          bvid,
          new Promise((resolve) => {
            waiting.push([bvid, resolve]);
            pump();
          }),
        );
      }
      return cache.get(bvid);
    };
  })();

  const parseCount = (text) => {
    const match = String(text || '')
      .replace(/,/g, '')
      .match(/([\d.]+)\s*([万亿萬億]?)/);
    if (!match) return NaN;
    const unit = { 万: 1e4, 萬: 1e4, 亿: 1e8, 億: 1e8 }[match[2]] || 1;
    return parseFloat(match[1]) * unit;
  };

  const parseDuration = (text) => {
    const parts = String(text || '')
      .trim()
      .split(':')
      .map(Number);
    if (parts.length < 2 || parts.some(Number.isNaN)) return NaN;
    return parts.reduce((total, part) => total * 60 + part, 0);
  };

  const parseAgeDays = (text) => {
    const date = String(text || '')
      .replace(/^[\s·]+/, '')
      .trim();
    if (!date) return NaN;
    if (/刚刚|分钟前|小时前|今天/.test(date)) return 0;
    if (/昨天/.test(date)) return 1;
    const daysAgo = date.match(/(\d+)\s*天前/);
    if (daysAgo) return Number(daysAgo[1]);

    const parts = date.match(/^(?:(\d{4})-)?(\d{1,2})-(\d{1,2})$/);
    if (!parts) return NaN;
    const now = new Date();
    const published = new Date(parts[1] ? Number(parts[1]) : now.getFullYear(), Number(parts[2]) - 1, Number(parts[3]));

    if (!parts[1] && published > now) published.setFullYear(published.getFullYear() - 1);
    return Math.floor((now - published) / 86400000);
  };

  const BVID_IN_URL = /\/video\/(BV[0-9A-Za-z]+)/;
  const bvidOfCard = (card) => (card.querySelector('a[href*="/video/BV"]')?.href || '').match(BVID_IN_URL)?.[1] || '';

  function setupFeed() {
    if (!IS_TOP || !(PAGE.www || PAGE.search)) return;

    let rules = null;
    const loadRules = () => {
      rules = {
        minViews: Number(val('x.feed.minView')) || 0,
        minSeconds: Number(val('x.feed.minDur')) || 0,
        maxSeconds: (Number(val('x.feed.maxDur')) || 0) * 60,
        maxAgeDays: Number(val('x.feed.maxAge')) || 0,
        noPortrait: !!val('x.feed.noPortrait'),
        keepFollowed: !!val('x.feed.keepFollowed'),
        blockedUps: new Set(linesOf(val('x.feed.ups'))),
      };
      rules.active = !!(
        rules.minViews ||
        rules.minSeconds ||
        rules.maxSeconds ||
        rules.maxAgeDays ||
        rules.noPortrait ||
        rules.blockedUps.size
      );
    };

    const judged = new WeakMap();
    const filterCard = (card) => {
      const bvid = bvidOfCard(card);
      if (!bvid || judged.get(card) === bvid) return;
      judged.set(card, bvid);

      const cell = card.closest('.feed-card') || card.closest('.bili-feed-card') || card;
      const setHidden = (hidden) => {
        if (judged.get(card) === bvid) cell.toggleAttribute('data-bga-feed-hidden', hidden);
      };
      const textOf = (selector) => card.querySelector(selector)?.textContent || '';

      const upName = textOf('.bili-video-card__info--author').trim();
      const upUid =
        (card.querySelector('a[href*="space.bilibili.com/"]')?.href || '').match(/space\.bilibili\.com\/(\d+)/)?.[1] ||
        '';
      if (rules.blockedUps.has(upName) || (upUid && rules.blockedUps.has(upUid))) return setHidden(true);
      if (rules.keepFollowed && /已关注/.test(textOf('.bili-video-card__info--icon-text'))) return setHidden(false);

      const views = parseCount(textOf('.bili-video-card__stats--item'));
      const seconds = parseDuration(textOf('.bili-video-card__stats__duration'));
      const ageDays = parseAgeDays(textOf('.bili-video-card__info--date'));
      const filteredOut =
        (rules.minViews && views < rules.minViews) ||
        (rules.minSeconds && seconds < rules.minSeconds) ||
        (rules.maxSeconds && seconds > rules.maxSeconds) ||
        (rules.maxAgeDays && ageDays > rules.maxAgeDays);
      if (filteredOut) return setHidden(true);
      setHidden(false);

      if (!rules.noPortrait) return;
      videoInfo(bvid).then((info) => {
        const size = info?.dimension;
        if (!size?.width) return;
        const [width, height] = size.rotate ? [size.height, size.width] : [size.width, size.height];
        if (height > width) setHidden(true);
      });
    };

    const COVER_CARDS = '.bili-video-card, .video-page-card-small, .video-card, .rank-item';
    const MAX_FRAMES = 120;
    const FRAMES_AFTER_PRUNE = 80;

    const randomFrames = new Map();

    const cutRandomFrame = async (bvid) => {
      const sheet = (await dm.getJSON(`https://api.bilibili.com/x/player/videoshot?bvid=${bvid}&index=1`))?.data;
      const perImage = (sheet?.img_x_len || 0) * (sheet?.img_y_len || 0);
      const total = Math.min(sheet?.index?.length || perImage, (sheet?.image?.length || 0) * perImage);
      if (!perImage || !total || !sheet.img_x_size) throw new Error('没有预览图');

      const pick = Math.min(total - 1, Math.floor(total * (0.1 + Math.random() * 0.8)));
      const imageIndex = Math.floor(pick / perImage);
      const cellIndex = pick % perImage;

      const image = new Image();
      image.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error('预览图加载失败'));
        image.src = String(sheet.image[imageIndex])
          .replace(/^\/\//, 'https://')
          .replace(/^http:/, 'https:');
      });
      const canvas = document.createElement('canvas');
      canvas.width = sheet.img_x_size;
      canvas.height = sheet.img_y_size;
      const sourceX = (cellIndex % sheet.img_x_len) * sheet.img_x_size;
      const sourceY = Math.floor(cellIndex / sheet.img_x_len) * sheet.img_y_size;
      canvas
        .getContext('2d')
        .drawImage(image, sourceX, sourceY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      if (!blob) throw new Error('画布导出失败');
      return URL.createObjectURL(blob);
    };

    const releaseFrame = (pending) => pending.then((url) => URL.revokeObjectURL(url)).catch(() => {});

    const pruneRandomFrames = () => {
      if (randomFrames.size <= MAX_FRAMES) return;
      const inUse = new Set(
        [...document.querySelectorAll('img[data-bga-cover]')].map((img) => img.dataset.bgaCover.split(':')[1]),
      );
      for (const [bvid, pending] of randomFrames) {
        if (randomFrames.size <= FRAMES_AFTER_PRUNE) break;
        if (inUse.has(bvid)) continue;
        randomFrames.delete(bvid);
        releaseFrame(pending);
      }
    };
    const randomFrame = (bvid) => {
      if (!randomFrames.has(bvid)) randomFrames.set(bvid, cutRandomFrame(bvid));
      pruneRandomFrames();
      return randomFrames.get(bvid);
    };
    const firstFrame = async (bvid) => {
      const frame = (await videoInfo(bvid))?.firstFrame;
      return frame ? `${coverBase(frame)}@672w_378h_1c.webp` : '';
    };

    const replaceCover = async (card) => {
      const mode = val('x.cover.mode');
      const bvid = bvidOfCard(card) || (card.matches('a') ? card.href.match(BVID_IN_URL)?.[1] || '' : '');
      const img = [...card.querySelectorAll('img')].find((el) =>
        /hdslb\.com\/bfs\/archive\//.test(el.currentSrc || el.src || ''),
      );

      const mark = `${mode}:${bvid}`;
      if (!bvid || !img || img.dataset.bgaCover === mark) return;
      img.dataset.bgaCover = mark;
      img.style.removeProperty('content');

      let url = '';
      if (mode === 'random') url = await randomFrame(bvid).catch(() => '');
      if (!url) url = await firstFrame(bvid).catch(() => '');

      if (!url || img.dataset.bgaCover !== mark || val('x.cover.mode') !== mode) return;

      img.style.setProperty('content', `url("${url}")`, 'important');
      img.style.setProperty('object-fit', 'cover', 'important');
    };

    const restoreCovers = () => {
      for (const img of document.querySelectorAll('img[data-bga-cover]')) {
        img.style.removeProperty('content');
        img.style.removeProperty('object-fit');
        delete img.dataset.bgaCover;
      }
      for (const pending of randomFrames.values()) releaseFrame(pending);
      randomFrames.clear();
    };

    const filtering = () => PAGE.home && rules.active;
    const replacingCovers = () => val('x.cover.mode') !== 'off';

    let scanQueued = false;
    const scan = () => {
      scanQueued = false;
      if (filtering()) {
        for (const card of document.querySelectorAll('.bili-video-card')) safe(() => filterCard(card), '首页过滤');
      }
      if (replacingCovers()) {
        const horizon = window.innerHeight * 1.6;
        for (const card of document.querySelectorAll(COVER_CARDS)) {
          const rect = card.getBoundingClientRect();
          if (rect.width > 60 && rect.bottom > -200 && rect.top < horizon) replaceCover(card).catch(() => {});
        }
      }
    };
    const queueScan = () => {
      if (scanQueued) return;
      scanQueued = true;
      setTimeout(scan, 250);
    };

    let observer = null;
    const applySettings = () => {
      loadRules();

      for (const cell of document.querySelectorAll('[data-bga-feed-hidden]'))
        cell.removeAttribute('data-bga-feed-hidden');
      for (const card of document.querySelectorAll('.bili-video-card')) judged.delete(card);
      if (!replacingCovers()) restoreCovers();

      const active = filtering() || replacingCovers();
      if (active && !observer) {
        observer = pageObserver(queueScan);
        observer.observe(document.body, { childList: true, subtree: true });
        window.addEventListener('scroll', queueScan, { passive: true });
      }
      if (!active && observer) {
        observer.disconnect();
        observer = null;
        window.removeEventListener('scroll', queueScan);
      }
      if (active) queueScan();
    };

    for (const key of FEED_OPTION_KEYS) store.on(key, applySettings);
    applySettings();
  }

  defOpt('x.card.save', true, {
    tab: 'general',
    group: t('影片卡片'),
    label: t('封面快速保存'),
    hint: t('滑鼠移到影片卡片上，封面左上角出現工具列，點「↓」下載原尺寸封面'),
  });
  defOpt('x.card.zoom', true, {
    tab: 'general',
    group: t('影片卡片'),
    label: t('封面懸浮放大'),
    hint: t('滑鼠停在工具列的放大鏡上，顯示大圖'),
  });
  defOpt('x.card.block', true, {
    tab: 'general',
    group: t('影片卡片'),
    label: t('一鍵拉黑 UP 主'),
    hint: t('點工具列的「⊘」直接加入 B站黑名單，再點一次取消；需要已登入'),
  });
  defOpt('x.card.sameTab', true, {
    tab: 'general',
    group: t('影片卡片'),
    label: t('影片在本頁打開'),
    hint: t('點影片卡片不再開新分頁；按住 ⌘ / Ctrl 或用中鍵點仍然開新分頁'),
  });

  const coverBase = (src) =>
    String(src || '')
      .replace(/^\/\//, 'https://')
      .replace(/^http:/, 'https:')
      .replace(/@.*$/, '');

  const safeFileName = (name) =>
    String(name || 'bilibili')
      .replace(/[\\/:*?"<>|\n\r]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100);

  const saveBlob = (blob, name, extension) => {
    const link = h('a', {
      href: URL.createObjectURL(blob),
      download: `${safeFileName(name)}.${extension}`,
      style: 'display:none',
    });
    (fullscreenElement() || document.body).appendChild(link);
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      link.remove();
    }, 60000);
  };

  const saveImage = async (url, name) => {
    let blob;
    try {
      const response = await fetch(url, { credentials: 'omit' });
      if (!response.ok) throw new Error(String(response.status));
      blob = await response.blob();
    } catch {
      blob = (await platform.request({ url, responseType: 'blob' })).blob;
    }
    if (!(blob instanceof Blob)) throw new Error(t('下載失敗'));
    const extension = (url.match(/\.(jpe?g|png|webp|gif|avif)$/i)?.[1] || 'jpg').toLowerCase();
    saveBlob(blob, name, extension);
  };

  const saveCurrentCover = async () => {
    const state = W.__INITIAL_STATE__;
    const cover =
      state?.videoData?.pic || state?.epInfo?.cover || document.querySelector('meta[property="og:image"]')?.content;
    const url = coverBase(cover);
    if (!url) return void toast(t('找不到這個影片的封面'), 'warn');
    try {
      const title = (state?.videoData?.title || document.title).slice(0, 60);
      await saveImage(url, `${title} ${state?.videoData?.bvid || ''}`);
      toast(t('封面已保存'), 'ok', 1500);
    } catch (error) {
      toast(t`封面保存失敗：${error.message || error}`, 'warn');
    }
  };

  const loginCsrf = () => document.cookie.match(/(?:^|;\s*)bili_jct=([^;]+)/)?.[1] || '';

  const setUserBlocked = async (uid, block) => {
    const response = await fetch('https://api.bilibili.com/x/relation/modify', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },

      body: new URLSearchParams({ fid: uid, act: block ? '5' : '6', re_src: '11', csrf: loginCsrf() }).toString(),
    });
    const result = await response.json();
    if (result?.code !== 0) throw new Error(result?.message || t`錯誤碼 ${result?.code}`);
  };

  const CARD_SELECTOR =
    '.bili-video-card, .video-page-card-small, .video-card, .rank-item, .small-item, .bili-dyn-card-video';
  const CARD_ICONS = {
    save: '<path d="M8 2.2v8M4.8 7.2L8 10.4l3.2-3.2M3 13.4h10"/>',
    zoom: '<circle cx="7" cy="7" r="4.2"/><path d="M10.2 10.2L13.6 13.6M5.2 7h3.6M7 5.2v3.6"/>',
    block: '<circle cx="8" cy="8" r="5.6"/><path d="M4.1 4.1l7.8 7.8"/>',
  };

  const readCard = (card) => {
    const isCover = (img) =>
      /hdslb\.com\/bfs\//.test(img.currentSrc || img.src || '') && img.getBoundingClientRect().width > 60;
    const img = [...card.querySelectorAll('img')].find(isCover);
    const videoLink = card.matches('a[href*="/video/"]')
      ? card
      : card.querySelector('a[href*="/video/BV"], a[href*="/video/av"]');
    const upLink = card.querySelector('a[href*="space.bilibili.com/"]');
    const textOf = (selector) => card.querySelector(selector)?.textContent || '';
    return {
      img,
      cover: img ? coverBase(img.currentSrc || img.src) : '',
      bvid: videoLink?.href.match(BVID_IN_URL)?.[1] || '',
      uid: upLink?.href.match(/space\.bilibili\.com\/(\d+)/)?.[1] || '',
      title: (
        textOf('.bili-video-card__info--tit, .title, .video-name, .bili-dyn-card-video__title') ||
        img?.alt ||
        ''
      ).trim(),
      upName: (
        textOf('.bili-video-card__info--author, .upname .name, .up-name__text, .up-name') ||
        upLink?.textContent ||
        ''
      ).trim(),
    };
  };

  function setupCards() {
    if (!IS_TOP || !(PAGE.www || PAGE.search || PAGE.t || PAGE.space)) return;

    const PLAYABLE = /bilibili\.com\/(video\/|bangumi\/play\/|list\/|medialist\/|festival\/)/;
    document.addEventListener(
      'click',
      (event) => {
        const plainClick = event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
        if (!val('x.card.sameTab') || !plainClick) return;
        const link = event.target.closest?.('a[target="_blank"]');
        if (link && PLAYABLE.test(link.href)) link.removeAttribute('target');
      },
      true,
    );

    const toolButton = (action, label) => {
      const button = h('button', { type: 'button', 'aria-label': label, title: label, dataset: { act: action } });
      button.append(svgIcon(CARD_ICONS[action]));
      return button;
    };
    const saveButton = toolButton('save', t('保存封面'));
    const zoomButton = toolButton('zoom', t('放大封面'));
    const blockButton = toolButton('block', t('拉黑 UP 主'));
    const toolbar = h('div', { id: 'bga-card-tools' }, saveButton, zoomButton, blockButton);
    const zoomBox = h('div', { id: 'bga-card-zoom' }, h('img', { alt: '', referrerpolicy: 'no-referrer' }));

    const blocked = new Map();
    let currentCard = null;
    let hideTimer = 0;

    const paintBlockButton = (uid) => blockButton.toggleAttribute('data-active', !!uid && blocked.has(uid));
    const hideToolbar = () => {
      currentCard = null;
      toolbar.removeAttribute('data-on');
      zoomBox.removeAttribute('data-on');
    };
    const hideToolbarSoon = () => {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(hideToolbar, 160);
    };
    const showToolbar = (card) => {
      clearTimeout(hideTimer);
      if (currentCard === card && toolbar.hasAttribute('data-on')) return;
      const data = readCard(card);
      if (!data.img) return hideToolbar();
      currentCard = card;
      saveButton.hidden = !val('x.card.save');
      zoomButton.hidden = !val('x.card.zoom');
      blockButton.hidden = !val('x.card.block') || !(data.uid || data.bvid);
      if ([saveButton, zoomButton, blockButton].every((button) => button.hidden)) return hideToolbar();
      paintBlockButton(data.uid);
      const cover = data.img.getBoundingClientRect();
      toolbar.style.left = `${Math.round(cover.left + 6)}px`;
      toolbar.style.top = `${Math.round(cover.top + 6)}px`;
      if (!toolbar.isConnected) document.body.append(toolbar, zoomBox);
      toolbar.setAttribute('data-on', '');
    };

    document.addEventListener(
      'mouseover',
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.closest('#bga-card-tools')) return void clearTimeout(hideTimer);
        if (!(val('x.card.save') || val('x.card.zoom') || val('x.card.block'))) return;
        const card = target.closest(CARD_SELECTOR);
        if (card) showToolbar(card);
        else if (currentCard) hideToolbarSoon();
      },
      true,
    );
    window.addEventListener('scroll', () => currentCard && hideToolbar(), { passive: true, capture: true });
    for (const type of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(type, hideToolbar);

    const ZOOM_MAX_WIDTH = 960;
    const ZOOM_MIN_ROOM = 420;
    const EDGE = 12;
    zoomButton.addEventListener('mouseenter', () => {
      const data = currentCard && readCard(currentCard);
      if (!data?.cover) return;
      const cover = data.img.getBoundingClientRect();

      const onRight = window.innerWidth - cover.right >= cover.left;
      const room = (onRight ? window.innerWidth - cover.right : cover.left) - 2 * EDGE;
      const beside = room >= ZOOM_MIN_ROOM;
      const width = Math.round(Math.min(ZOOM_MAX_WIDTH, beside ? room : window.innerWidth * 0.6));
      const height = Math.round((width * 9) / 16);
      let left = Math.max(EDGE, (window.innerWidth - width) / 2);
      if (beside) left = onRight ? cover.right + EDGE : cover.left - width - EDGE;
      const centered = cover.top + cover.height / 2 - height / 2;
      const top = Math.min(Math.max(EDGE, centered), Math.max(EDGE, window.innerHeight - height - EDGE));
      zoomBox.style.cssText = `left:${Math.round(left)}px;top:${Math.round(top)}px;width:${width}px;aspect-ratio:16/9;`;
      zoomBox.firstElementChild.src = `${data.cover}@1280w.webp`;
      zoomBox.setAttribute('data-on', '');
    });
    zoomButton.addEventListener('mouseleave', () => zoomBox.removeAttribute('data-on'));
    zoomButton.addEventListener('click', () => {
      const data = currentCard && readCard(currentCard);
      if (data?.cover) window.open(data.cover, '_blank', 'noopener');
    });

    saveButton.addEventListener('click', async () => {
      const data = currentCard && readCard(currentCard);
      if (!data?.cover) return;
      saveButton.setAttribute('data-busy', '');
      try {
        await saveImage(data.cover, `${data.title.slice(0, 60)} ${data.bvid}`);
        toast(t('封面已保存'), 'ok', 1500);
      } catch (error) {
        toast(t`封面保存失敗：${error.message || error}`, 'warn');
      } finally {
        saveButton.removeAttribute('data-busy');
      }
    });

    const markCardsOf = (uid, isBlocked) => {
      const spaceLink = new RegExp(`space\\.bilibili\\.com/${uid}(?:[/?#]|$)`);
      for (const link of document.querySelectorAll(`a[href*="space.bilibili.com/${uid}"]`)) {
        if (spaceLink.test(link.href)) link.closest(CARD_SELECTOR)?.toggleAttribute('data-bga-up-blocked', isBlocked);
      }
    };

    const ownerOf = async (bvid) => {
      const owner = (await dm.getJSON(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`))?.data?.owner;
      return { uid: owner?.mid ? String(owner.mid) : '', upName: owner?.name || '' };
    };
    blockButton.addEventListener('click', async () => {
      const card = currentCard;
      const data = card && readCard(card);
      if (!data) return;
      if (!loginCsrf()) return void toast(t('要先登入 B站才能拉黑'), 'warn');
      blockButton.setAttribute('data-busy', '');
      try {
        let { uid, upName } = data;
        if (!uid && data.bvid) {
          const owner = await ownerOf(data.bvid);
          uid = owner.uid;
          upName ||= owner.upName;
        }
        if (!uid) throw new Error(t('找不到 UP 主'));
        const block = !blocked.has(uid);
        await setUserBlocked(uid, block);
        if (block) blocked.set(uid, upName);
        else blocked.delete(uid);
        markCardsOf(uid, block);

        if (!data.uid) card.toggleAttribute('data-bga-up-blocked', block);
        paintBlockButton(uid);
        const who = upName || uid;
        toast(block ? t`已拉黑「${who}」，再點一次 ⊘ 可取消` : t`已取消拉黑「${who}」`, 'ok', 3200);
      } catch (error) {
        toast(t`拉黑失敗：${error.message || error}`, 'warn');
      } finally {
        blockButton.removeAttribute('data-busy');
      }
    });
  }

  defOpt('x.home.theme', 'plain', {
    tab: 'home',
    group: t('首頁主題'),
    type: 'select',
    label: t('主題'),
    hint: t('極簡：只有影片列表。大寶鑑：最上面是整幅海報的影片推薦，右下是你關注的更新，往下滑才是影片列表'),
    choices: [
      ['plain', t('極簡')],
      ['hero', t('大寶鑑')],
    ],
  });
  defOpt('x.home.source', 'popular', {
    tab: 'home',
    group: t('大寶鑑'),
    type: 'select',
    label: t('海報的推薦來源'),
    choices: [
      ['popular', t('綜合熱門')],
      ['weekly', t('每週必看')],
      ['ranking', t('排行榜')],
      ['precious', t('入站必刷')],
      ['follow', t('我關注的')],
    ],
    hint: t('「我關注的」是你關注的 UP 主最近的投稿，要登入 B站；沒登入時改用綜合熱門'),
  });
  defOpt('x.home.preview', false, {
    tab: 'home',
    group: t('大寶鑑'),
    label: t('海報上預覽播放'),
    hint: t('換到一部影片時，海報變成這部影片的畫面，在首頁直接無聲播放；點「播放」才進影片頁。系統開了「減少動態效果」時不播'),
  });
  defOpt('x.home.previewSound', false, {
    tab: 'home',
    group: t('大寶鑑'),
    label: t('預覽有聲音'),
    hint: t('瀏覽器規定網頁要先被點過一下才能自己出聲：剛打開首頁時先無聲，點過頁面任何地方之後的預覽就有聲音。海報上的喇叭按鈕可以隨時切換'),
  });
  defOpt('x.home.previewStay', true, {
    tab: 'home',
    group: t('大寶鑑'),
    label: t('滑鼠停在海報上就繼續看'),
    hint: t('預覽播放中，滑鼠在海報上停一秒半：不再換下一部，換成清楚一點的畫面接著播到結束，播完才換。點畫面在影片頁從同一個時間點接著看'),
  });
  defOpt('x.home.side', 'all', {
    tab: 'home',
    group: t('大寶鑑'),
    type: 'select',
    label: t('右下角放什麼'),
    hint: t('關注的動態要登入 B站，沒登入時改放海報同一來源的其他影片。和海報選同一個來源時，右下接著放海報沒輪到的那些'),
    choices: [
      ['all', t('關注的全部動態')],
      ['video', t('關注的影片')],
      ['popular', t('綜合熱門')],
      ['weekly', t('每週必看')],
      ['ranking', t('排行榜')],
      ['precious', t('入站必刷')],
      ['off', t('不顯示')],
    ],
  });
  defOpt('x.home.interval', 8, {
    tab: 'home',
    group: t('大寶鑑'),
    label: t('海報多久換一張'),
    hint: t('滑鼠停在播放那一排按鈕上時暫停；系統開了「減少動態效果」就不自動換'),
    unit: t('秒'),
    step: 1,
  });
  defOpt('x.home.quality', 'original', {
    tab: 'home',
    group: t('大寶鑑'),
    type: 'select',
    label: t('海報畫質'),
    hint: t('原圖最清楚，每張約 0.2–1 MB；再清楚也不會超過 UP 主上傳的封面'),
    choices: [
      ['original', t('原圖')],
      ['compact', t('壓縮')],
    ],
  });
  defOpt('x.home.count', 16, {
    tab: 'home',
    group: t('大寶鑑'),
    label: t('海報輪流放幾部影片'),
    hint: t('最少 4 部，最多 30 部'),
    unit: t('部'),
    step: 1,
  });
  defOpt('x.home.noSwipe', false, {
    tab: 'home',
    group: t('影片列表'),
    label: t('不顯示左上角那塊大的輪播推薦'),
  });
  defOpt('x.home.noFloor', false, {
    tab: 'home',
    group: t('影片列表'),
    label: t('不顯示直播、番劇等推薦卡'),
    hint: t('影片列表中間帶「直播」「番劇」「綜藝」這類角標的卡片'),
  });

  const heroSize = () => Math.min(30, Math.max(4, Math.round(Number(val('x.home.count')) || 16)));
  const HERO_ICONS = {
    play: '<path d="M5 2.6v12.8a.6.6 0 00.92.5l10-6.4a.6.6 0 000-1L5.92 2.1A.6.6 0 005 2.6z"/>',
    later: '<circle cx="9" cy="9" r="6.6"/><path d="M9 5.2V9l2.6 1.7"/>',
    previous: '<path d="M11 3.5L5.5 9l5.5 5.5"/>',
    next: '<path d="M7 3.5L12.5 9 7 14.5"/>',
    sound: '<path d="M3 7v4h3l4 3.5v-11L6 7H3z"/><path d="M12.5 6.2a4 4 0 010 5.6M14.6 4.2a7 7 0 010 9.6"/>',
    muted: '<path d="M3 7v4h3l4 3.5v-11L6 7H3z"/><path d="M12.5 7l4 4M16.5 7l-4 4"/>',
  };

  const SOURCE_LINKS = {
    popular: 'https://www.bilibili.com/v/popular/all',
    weekly: 'https://www.bilibili.com/v/popular/weekly',
    ranking: 'https://www.bilibili.com/v/popular/rank/all',
    precious: 'https://www.bilibili.com/v/popular/history',
  };
  const SOURCE_NAMES = {
    popular: t('綜合熱門'),
    weekly: t('每週必看'),
    ranking: t('排行榜'),
    precious: t('入站必刷'),
    follow: t('我關注的'),
  };

  const apiData = async (path) => {
    const result = await dm.getJSON(`https://api.bilibili.com${path}`);
    if (result?.code !== 0) throw new Error(result?.message || t`錯誤碼 ${result?.code}`);
    return result.data;
  };

  const countValue = (text) => {
    const match = String(text ?? '').replace(/,/g, '').match(/^([\d.]+)\s*(万|萬|亿|億)?/);
    if (!match) return NaN;
    return Number(match[1]) * ({ 万: 1e4, 萬: 1e4, 亿: 1e8, 億: 1e8 }[match[2]] || 1);
  };

  const clockValue = (text) =>
    String(text || '')
      .split(':')
      .reduce((total, part) => total * 60 + (Number(part) || 0), 0);

  const fetchFollowVideos = async () => {
    const pages = [];
    let offset = '';

    for (let page = 1; page <= 3 && pages.length < heroSize(); page += 1) {
      const query = `type=video&page=${page}&timezone_offset=-480${offset ? `&offset=${encodeURIComponent(offset)}` : ''}`;
      const data = await apiData(`/x/polymer/web-dynamic/v1/feed/all?${query}`);
      for (const item of data.items || []) {
        const archive = item.modules?.module_dynamic?.major?.archive;
        const author = item.modules?.module_author || {};
        if (!archive?.bvid) continue;
        pages.push({
          bvid: archive.bvid,
          pic: archive.cover,
          title: archive.title,
          desc: archive.desc,
          duration: clockValue(archive.duration_text),
          pubdate: Number(author.pub_ts) || 0,
          owner: { mid: author.mid, name: author.name },
          stat: { view: countValue(archive.stat?.play) },
        });
      }
      offset = data.offset;
      if (!data.has_more || !offset) break;
    }
    return pages;
  };

  const fetchSourceVideos = async (source) => {
    if (source === 'follow') {
      if (loginCsrf()) {
        const videos = await fetchFollowVideos();
        if (videos.length) return videos;
      }
      return fetchSourceVideos('popular');
    }
    if (source === 'weekly') {
      const latest = (await apiData('/x/web-interface/popular/series/list')).list[0].number;
      return (await apiData(`/x/web-interface/popular/series/one?number=${latest}`)).list;
    }
    if (source === 'ranking') return (await apiData('/x/web-interface/ranking/v2?rid=0&type=all')).list;
    if (source === 'precious') return (await apiData('/x/web-interface/popular/precious')).list;
    return (await apiData('/x/web-interface/popular?ps=50&pn=1')).list;
  };

  const secureUrl = (url) => String(url || '').replace(/^(?:https?:)?\/\//, 'https://');
  const countText = (count) => {
    if (!(count >= 0)) return '';
    return count >= 1e4 ? COMPACT_NUMBER.format(count) : String(count);
  };
  const clockText = (seconds) => {
    const parts = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60];
    if (!parts[0]) parts.shift();
    return parts.map((part, index) => (index ? String(part).padStart(2, '0') : part)).join(':');
  };
  const dateText = (timestamp) => new Date(timestamp * 1000).toLocaleDateString('zh-TW');

  const cardOfVideo = (video) => ({
    link: `https://www.bilibili.com/video/${video.bvid}`,
    cover: secureUrl(video.pic),
    title: video.title,
    note: [video.owner?.name, countText(video.stat?.view) && t`${countText(video.stat.view)} 次播放`]
      .filter(Boolean)
      .join(' · '),
  });

  const cardOfDynamic = (item) => {
    const author = item.modules?.module_author || {};
    const content = item.modules?.module_dynamic || {};
    const major = content.major || {};
    const body = major.archive || major.pgc || major.article || major.opus || major.draw || major.live_rcmd;
    if (!body && !content.desc?.text) return null;
    const cover = body?.cover || body?.covers?.[0] || body?.pics?.[0]?.url || body?.items?.[0]?.src || author.face || '';
    const title = body?.title || body?.summary?.text || content.desc?.text || '';
    if (!cover || !title) return null;
    return {
      link: secureUrl(body?.jump_url) || `https://t.bilibili.com/${item.id_str}`,
      cover: secureUrl(cover),
      title: title.trim().split('\n')[0],
      note: [author.name, author.pub_time].filter(Boolean).join(' · '),
    };
  };

  const fetchFollowCards = async (onlyVideo) => {
    if (!loginCsrf()) return null;
    try {
      const type = onlyVideo ? 'video' : 'all';
      const data = await apiData(`/x/polymer/web-dynamic/v1/feed/all?type=${type}&page=1&timezone_offset=-480`);
      const cards = (data.items || []).map(cardOfDynamic).filter(Boolean);
      return cards.length ? cards : null;
    } catch (error) {
      warn('读关注动态失败', error);
      return null;
    }
  };

  const buildHero = (videos, side) => {
    const slides = videos.slice(0, heroSize());
    const sourceName = SOURCE_NAMES[val('x.home.source')] || SOURCE_NAMES.popular;
    let current = -1;

    const layers = [h('img', { class: 'bga-hero-bg', alt: '' }), h('img', { class: 'bga-hero-bg', alt: '' })];
    const preview = createHeroPreview({
      onEnded: () => show(current + 1),
      onState: () => syncPreviewUi(),
    });

    const soundOn = svgIcon(HERO_ICONS.sound, 18);
    const soundOff = svgIcon(HERO_ICONS.muted, 18);
    const soundButton = h('button', { class: 'bga-hero-round bga-hero-sound', type: 'button' }, soundOn, soundOff);
    soundButton.addEventListener('click', () => preview.setSound(!preview.sounding));
    const watchBar = h('div', { class: 'bga-hero-watchbar' }, h('i'));

    const armHint = h('div', { class: 'bga-hero-arm' }, h('span', {}, t('停住就繼續看')), h('i'));
    const info = h('div', { class: 'bga-hero-info' });
    const dots = h(
      'div',
      { class: 'bga-hero-dots' },
      slides.map((video, index) => h('button', { type: 'button', title: video.title, onclick: () => show(index) })),
    );
    const iconButton = (icon, title, onclick) => {
      const button = h('button', { class: 'bga-hero-round', type: 'button', title, onclick });
      button.append(svgIcon(HERO_ICONS[icon], 18));
      return button;
    };

    const renderInfo = (video) => {
      const play = h('a', {
        class: 'bga-hero-play',
        href: `https://www.bilibili.com/video/${video.bvid}`,
        target: '_blank',
      });
      play.append(svgIcon(HERO_ICONS.play, 18), t('[按鈕]播放'));
      const description = String(video.desc || '').trim();
      const tags = [
        video.tname && h('span', {}, video.tname),
        video.rcmd_reason?.content && h('span', {}, video.rcmd_reason.content),

        countText(video.stat?.view) && h('span', {}, t`${countText(video.stat.view)} 次播放`),
        video.stat?.like > 0 && h('span', {}, t`${countText(video.stat.like)} 讚`),
      ];
      const metaBits = [
        h('b', {}, sourceName),
        h('a', { href: `https://space.bilibili.com/${video.owner?.mid}`, target: '_blank' }, video.owner?.name || ''),
        video.pubdate > 0 && h('span', {}, dateText(video.pubdate)),
        video.duration > 0 && h('span', {}, clockText(video.duration)),
      ];
      info.replaceChildren(
        h('div', { class: 'bga-hero-meta' }, metaBits),
        h('h2', { class: 'bga-hero-title' }, video.title),
        h('div', { class: 'bga-hero-tags' }, tags),
        description.length > 1 ? h('p', { class: 'bga-hero-desc' }, description) : '',
        h(
          'div',
          { class: 'bga-hero-actions' },
          play,
          iconButton('later', t('稍後再看'), () => addToWatchLater(video.bvid)),
          iconButton('previous', t('上一部'), () => show(current - 1)),
          iconButton('next', t('下一部'), () => show(current + 1)),
          soundButton,
        ),
      );

      info.style.animation = 'none';
      void info.offsetWidth;
      info.style.animation = '';
    };

    function show(index) {
      const next = (index + slides.length) % slides.length;
      if (next === current) return;
      current = next;
      setWatching(false);
      const video = slides[current];

      const incoming = layers.find((layer) => !layer.hasAttribute('data-on')) || layers[0];
      const outgoing = layers.find((layer) => layer !== incoming);
      incoming.onload = () => {
        incoming.toggleAttribute('data-on', true);
        outgoing.toggleAttribute('data-on', false);
      };

      const cover = secureUrl(video.pic);
      incoming.src = val('x.home.quality') === 'compact' ? `${cover}@1920w_1080h_1c.webp` : cover;
      renderInfo(video);
      [...dots.children].forEach((dot, at) => dot.toggleAttribute('data-on', at === current));
      preview.load(video);
    }

    const element = h(
      'section',
      { id: 'bga-hero', class: 'bga-ui', 'aria-label': t('推薦影片') },
      layers,
      preview.element,
      h('div', { class: 'bga-hero-shade' }),
      h('div', { class: 'bga-hero-left' }, info, dots),
      side && buildHeroSide(side),
      watchBar,
      armHint,
    );
    element.style.setProperty('--bga-hero-interval', `${Math.max(3, Number(val('x.home.interval')) || 8)}s`);

    dots.addEventListener('animationend', (event) => {
      if (event.animationName === 'bga-hero-fill') show(current + 1);
    });
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

    let hovering = false;

    const DWELL = 1500;
    let watching = false;
    let dwell = 0;
    let pointerOnPoster = false;
    const disarm = () => {
      clearTimeout(dwell);
      dwell = 0;
      element.removeAttribute('data-arming');
    };
    const arm = () => {
      if (dwell || watching || !pointerOnPoster || !preview.playing || !val('x.home.previewStay')) return;
      element.toggleAttribute('data-arming', true);
      dwell = setTimeout(() => {
        dwell = 0;
        element.removeAttribute('data-arming');
        if (pointerOnPoster && preview.playing) setWatching(true);
      }, DWELL);
    };

    let idle = 0;
    const setIdle = (on) => {
      element.toggleAttribute('data-idle', on);
      flag('home-hero-idle', on);
    };

    const busy = () => {
      const active = document.activeElement;
      if (active?.matches?.('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return true;
      return !!document.querySelector('.bga-nav:is(:hover, :focus-within)');
    };
    const sleep = () => {
      if (busy()) idle = setTimeout(sleep, 1000);
      else setIdle(true);
    };
    const wake = () => {
      setIdle(false);
      clearTimeout(idle);
      if (preview.playing && scrollY < innerHeight * 0.6) idle = setTimeout(sleep, 2500);
    };
    function setWatching(on) {
      disarm();
      if (on === watching) return;
      watching = on;
      element.toggleAttribute('data-watching', on);
      preview.setWatching(on);
      wake();
      updatePaused();
    }
    function syncPreviewUi() {
      const live = preview.playing;
      const was = element.hasAttribute('data-previewing');
      element.toggleAttribute('data-previewing', live);
      if (live && !was) {
        arm();
        wake();
      }
      if (!live && was) {
        disarm();
        wake();
      }
      soundOn.style.display = preview.sounding ? '' : 'none';
      soundOff.style.display = preview.sounding ? 'none' : '';
      soundButton.title = preview.sounding ? t('關閉聲音') : t('開啟聲音');
      watchBar.firstChild.style.transform = `scaleX(${preview.progress})`;
    }
    const updatePaused = () => {
      const away = reducedMotion.matches || document.hidden || scrollY > innerHeight * 0.6;
      element.toggleAttribute('data-paused', hovering || watching || away);

      preview.setActive(!away);
    };

    const onPoster = (target) => !target.closest?.('.bga-hero-side, .bga-hero-actions, .bga-hero-dots');
    element.addEventListener('mouseover', (event) => {
      hovering = !!event.target.closest?.('.bga-hero-actions');
      updatePaused();
    });
    element.addEventListener('pointermove', (event) => {
      wake();
      const now = onPoster(event.target);
      if (now === pointerOnPoster) return;
      pointerOnPoster = now;
      if (now) arm();
      else disarm();
    });
    element.addEventListener('mouseleave', () => {
      pointerOnPoster = false;
      disarm();
      hovering = false;
      updatePaused();
    });

    element.addEventListener('click', (event) => {
      const path = event.composedPath();
      const onControl = path.some((node) => node instanceof Element && node.matches('a, button, .bga-hero-side, .bga-hero-actions, .bga-hero-dots'));
      if (!watching || onControl) return;
      const time = Math.floor(preview.time);
      window.open(`https://www.bilibili.com/video/${slides[current].bvid}/${time > 0 ? `?t=${time}` : ''}`, '_blank', 'noopener');
      preview.setActive(false);
    });
    const abort = new AbortController();
    document.addEventListener('visibilitychange', updatePaused, { signal: abort.signal });
    addEventListener('scroll', updatePaused, { passive: true, signal: abort.signal });
    addEventListener('scroll', wake, { passive: true, signal: abort.signal });

    document.addEventListener('focusin', wake, { signal: abort.signal });
    document.addEventListener('keydown', wake, { signal: abort.signal });
    updatePaused();
    show(0);

    return {
      element,
      destroy() {
        abort.abort();
        clearTimeout(idle);
        flag('home-hero-idle', false);
        preview.stop();
        element.remove();
      },
    };
  };

  function createHeroPreview({ onEnded, onState }) {
    const makeVideo = () => {
      const element = h('video', { class: 'bga-hero-video', muted: true, playsinline: true, preload: 'none', 'aria-hidden': 'true' });
      element.muted = true;
      element.addEventListener('timeupdate', () => element === video && state());
      element.addEventListener('volumechange', () => element === video && state());
      element.addEventListener('ended', () => element === video && watching && onEnded?.());
      return element;
    };

    const box = h('div', { class: 'bga-hero-media' });
    let video = makeVideo();
    box.append(video);
    const WAIT = 1200;
    const VIDEO_HOST = /^https:\/\/[\w.-]+\.(bilivideo\.(com|cn)|akamaized\.net|hdslb\.com)\//;
    let timer = 0;
    let token = 0;
    let active = true;
    let watching = false;
    let item = null;
    let cid = 0;
    const enabled = () => val('x.home.preview') && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const state = () => onState?.();

    const stop = () => {
      clearTimeout(timer);
      token += 1;
      watching = false;
      for (const extra of [...box.children].filter((element) => element !== video)) extra.remove();
      video.removeAttribute('data-on');
      video.pause();
      video.removeAttribute('src');
      video.load();
      state();
    };
    const cidOf = async (entry) => {
      if (entry.cid) return entry.cid;
      return (await apiData(`/x/player/pagelist?bvid=${encodeURIComponent(entry.bvid)}`))?.[0]?.cid;
    };

    const sourceOf = async (quality) => {
      const play = await apiData(
        `/x/player/playurl?bvid=${encodeURIComponent(item.bvid)}&cid=${cid}&qn=${quality}&fnval=1&platform=html5&high_quality=1`,
      );
      const url = secureUrl(play?.durl?.[0]?.url);
      return VIDEO_HOST.test(url) ? { url, quality: Number(play.quality) || 0 } : null;
    };

    const BEST = 120;
    let shown = 0;

    const playNow = async () => {
      if (!active) return;
      video.muted = !val('x.home.previewSound');
      try {
        await video.play();
      } catch (error) {
        if (video.muted || error?.name !== 'NotAllowedError') throw error;
        video.muted = true;
        await video.play();
      }
      state();
    };
    const start = async (mine) => {
      try {
        cid = await cidOf(item);
        if (mine !== token || !cid) return;
        const source = await sourceOf(loginCsrf() ? BEST : 32);
        if (mine !== token || !source) return;
        shown = source.quality;
        video.src = source.url;
        video.onplaying = () => mine === token && (video.toggleAttribute('data-on', true), state());
        await playNow();
      } catch (error) {
        log('大寶鑑预览没放成', error?.message || error);
      }
    };

    return {
      element: box,
      stop,
      load(next) {
        stop();
        item = next;
        if (!enabled() || !item?.bvid) return;
        const mine = token;
        timer = setTimeout(() => start(mine), WAIT);
      },
      setActive(on) {
        if (on === active) return;
        active = on;
        if (!video.getAttribute('src')) return;
        if (on) playNow().catch(() => {});
        else video.pause();
        state();
      },

      async setWatching(on) {
        watching = on;
        if (!on || !video.getAttribute('src')) return;
        const mine = token;
        try {
          const source = await sourceOf(BEST);

          if (mine !== token || !watching || !source || source.quality <= shown) return;

          const sharp = makeVideo();

          sharp.muted = true;
          sharp.preload = 'auto';
          box.prepend(sharp);
          sharp.addEventListener(
            'loadedmetadata',

            () => mine === token && (sharp.currentTime = Math.min(sharp.duration || Infinity, video.currentTime + 1.5)),
            { once: true },
          );
          sharp.addEventListener(
            'playing',
            () => {
              if (mine !== token) return void sharp.remove();
              const old = video;
              video = sharp;
              sharp.toggleAttribute('data-on', true);
              box.append(sharp);
              sharp.muted = old.muted;
              old.pause();
              old.remove();
              state();
            },
            { once: true },
          );
          sharp.addEventListener('playing', () => (shown = source.quality), { once: true });
          sharp.src = source.url;
          if (active) await sharp.play();
        } catch (error) {
          log('大寶鑑换清楚的画面没成', error?.message || error);
        }
      },
      setSound(on) {
        store.set('x.home.previewSound', on);

        video.muted = !on;
        if (on && video.paused && active && video.getAttribute('src')) video.play().catch(() => {});
        state();
      },
      get playing() {
        return video.hasAttribute('data-on') && !!video.getAttribute('src');
      },
      get sounding() {
        return !video.muted;
      },
      get time() {
        return video.currentTime || 0;
      },
      get progress() {
        return watching && video.duration ? Math.min(1, video.currentTime / video.duration) : 0;
      },
    };
  }

  function buildHeroSide({ title, link, cards }) {
    const row = h(
      'div',
      { class: 'bga-hero-row' },
      cards
        .slice(0, 18)
        .map((card) =>
          h(
            'a',
            { class: 'bga-hero-card', href: card.link, target: '_blank', title: card.title },
            h('img', { src: `${card.cover}@480w_270h_1c.webp`, alt: '', loading: 'lazy' }),
            h('b', {}, card.title),
            h('small', {}, card.note),
          ),
        ),
    );
    const pageButton = (icon, label, direction) => {
      const button = h('button', {
        class: 'bga-hero-round',
        type: 'button',
        title: label,
        onclick: () => row.scrollBy({ left: direction * row.clientWidth, behavior: 'smooth' }),
      });
      button.append(svgIcon(HERO_ICONS[icon], 18));
      return button;
    };
    return h(
      'div',
      { class: 'bga-hero-side' },
      h(
        'div',
        { class: 'bga-hero-side-head' },
        h('span', {}, link ? h('a', { href: link, target: '_blank' }, `${title} ›`) : title),
        pageButton('previous', t('往前'), -1),
        pageButton('next', t('往後'), 1),
      ),
      row,
    );
  }

  const watchNavScroll = (signal) => {
    let lastY = scrollY;
    addEventListener(
      'scroll',
      () => {
        const y = scrollY;
        if (Math.abs(y - lastY) < 6) return;
        flag('home-nav-hidden', y > lastY && y > 80);
        flag('home-nav-over-hero', y < innerHeight - 70);
        lastY = y;
      },
      { passive: true, signal },
    );
    flag('home-nav-over-hero', scrollY < innerHeight - 70);
  };

  function setupHome() {
    reflect('x.home.noSwipe', 'home-no-swipe');
    reflect('x.home.noFloor', 'home-no-floor');
    if (!PAGE.home || !IS_TOP) return;

    let hero = null;
    let abort = null;
    let generation = 0;

    const unmount = () => {
      generation += 1;
      hero?.destroy();
      abort?.abort();
      hero = abort = null;
      for (const token of ['home-hero', 'home-nav-hidden', 'home-nav-over-hero']) flag(token, false);
    };

    const RETRY_DELAYS = [1200, 4000];

    const mount = async (attempt = 0) => {
      unmount();
      if (val('x.home.theme') !== 'hero') return;
      const mine = generation;
      flag('home-hero', true);
      abort = new AbortController();
      watchNavScroll(abort.signal);
      try {
        const source = val('x.home.source');

        const sideMode = val('x.home.side');
        const sideFollows = sideMode === 'all' || sideMode === 'video';
        const sideList = !sideFollows && sideMode !== 'off' && sideMode !== source && SOURCE_LINKS[sideMode];
        const [videos, follow, listed] = await Promise.all([
          fetchSourceVideos(source),
          sideFollows ? fetchFollowCards(sideMode === 'video') : null,
          sideList ? fetchSourceVideos(sideMode).catch(() => null) : null,
        ]);
        if (mine !== generation) return;
        if (!videos?.length) throw new Error(t('來源是空的'));

        const onPoster = new Set(videos.slice(0, heroSize()).map((video) => video.bvid));
        const fresh = (list) => list.filter((video) => !onPoster.has(video.bvid)).map(cardOfVideo);
        let side = null;
        const notOnPoster = (card) => ![...onPoster].some((bvid) => card.link.includes(bvid));
        if (follow?.some(notOnPoster)) side = { title: t('關注更新'), link: 'https://t.bilibili.com/', cards: follow.filter(notOnPoster) };
        else if (listed?.length) side = { title: SOURCE_NAMES[sideMode], link: SOURCE_LINKS[sideMode], cards: fresh(listed) };

        else if (sideMode !== 'off') side = { title: t('更多推薦'), cards: fresh(videos.slice(heroSize())) };
        hero = buildHero(videos, side?.cards.length ? side : null);
        document.body.append(hero.element);
      } catch (error) {
        if (mine !== generation) return;
        warn('大寶鑑载入失败', error);
        if (attempt < RETRY_DELAYS.length) {
          setTimeout(() => mine === generation && mount(attempt + 1), RETRY_DELAYS[attempt]);
          return;
        }
        unmount();
        toast(t`大寶鑑載入失敗：${error.message || error}`, 'warn');
      }
    };

    for (const key of ['x.home.theme', 'x.home.source', 'x.home.side', 'x.home.interval', 'x.home.count', 'x.home.quality', 'x.home.preview']) store.on(key, () => mount());
    mount();

    const ensure = () => {
      if (val('x.home.theme') === 'hero' && !hasFlag('home-hero')) mount();
    };
    for (const delay of [300, 1000, 3000]) setTimeout(ensure, delay);
    addEventListener('pageshow', ensure);
    document.addEventListener('visibilitychange', () => document.hidden || ensure());
  }

  defOpt('x.dyn.noForward', false, { tab: 'feed', group: t('動態過濾'), label: t('隱藏轉發') });
  defOpt('x.dyn.noLive', false, { tab: 'feed', group: t('動態過濾'), label: t('隱藏直播通知') });
  defOpt('x.dyn.noReserve', false, { tab: 'feed', group: t('動態過濾'), label: t('隱藏預約（直播 / 影片預約）') });
  defOpt('x.dyn.noCharge', false, { tab: 'feed', group: t('動態過濾'), label: t('隱藏充電專屬') });
  defOpt('x.dyn.noArticle', false, { tab: 'feed', group: t('動態過濾'), label: t('隱藏專欄') });
  defOpt('x.dyn.words', '', {
    tab: 'feed',
    group: t('動態過濾'),
    type: 'text',
    keep: true,
    label: t('內容含有這些詞就隱藏'),
    hint: t('每行一個詞；也可以寫 /正則/。比對動態文字、影片標題和被轉發的內容。改動後往下捲載入的新動態開始生效'),
    placeholder: t('抽奖\n/互动抽奖|转发抽奖/'),
  });

  const DYNAMIC_AD_PRESET = [
    '恰饭',
    '金主爸爸',
    '优惠券',
    '领券',
    '满减',
    '到手价',
    '补贴价',
    '限时折扣',
    '专属福利',
    '旗舰店',
    '直播间下单',
    '团购价',
    '同款链接',
    '评论区置顶链接',
    '/(?:淘宝|天猫|京东|拼多多|抖音商城)(?:搜索?|下单|领券)/',
    '/[戳点]我?(?:领取|下单|购买|抢购)/',
    '/双\\s?(?:11|十一|12|十二)|6\\s?18(?:大促|活动|预售)?/',
  ];

  ACTIONS.push({
    tab: 'feed',
    group: t('動態過濾'),
    label: t('加入常見的廣告用詞'),
    hint: t('把一組常見的帶貨、促銷用語加進上面的清單，補足只靠商品卡片認不出來的廣告動態；之後可以自己增刪'),
    button: t('加入'),
    run() {
      const current = linesOf(val('x.dyn.words'));
      const missing = DYNAMIC_AD_PRESET.filter((word) => !current.includes(word));
      if (!missing.length) return void toast(t('這些詞都已經在清單裡了'));
      store.set('x.dyn.words', [...current, ...missing].join('\n'));
      toast(t`已加入 ${missing.length} 個詞`, 'ok');
    },
  });

  const dynamicRules = () => ({
    forward: val('x.dyn.noForward'),
    live: val('x.dyn.noLive'),
    reserve: val('x.dyn.noReserve'),
    charge: val('x.dyn.noCharge'),
    article: val('x.dyn.noArticle'),
    words: parseWordList(val('x.dyn.words')),
  });
  const hasDynamicRules = (rules) =>
    !!(rules.forward || rules.live || rules.reserve || rules.charge || rules.article || rules.words.length);

  const dynamicText = (item, depth = 0) => {
    if (!item || depth > 2) return '';
    const content = item.modules?.module_dynamic || {};
    const major = content.major || {};
    return [
      content.desc?.text,
      major.archive?.title,
      major.archive?.desc,
      major.opus?.title,
      major.opus?.summary?.text,
      major.article?.title,
      major.article?.desc,
      major.pgc?.title,
      major.common?.title,
      major.common?.desc,
      content.additional?.reserve?.title,
      dynamicText(item.orig, depth + 1),
    ]
      .filter(Boolean)
      .join('\n');
  };

  const isUnwantedDynamic = (item, rules) => {
    const type = String(item?.type || '');
    const content = item?.modules?.module_dynamic || {};
    if (rules.forward && type === 'DYNAMIC_TYPE_FORWARD') return true;
    if (rules.live && type.startsWith('DYNAMIC_TYPE_LIVE')) return true;
    if (rules.article && type === 'DYNAMIC_TYPE_ARTICLE') return true;
    if (rules.reserve && content.additional?.type === 'ADDITIONAL_TYPE_RESERVE') return true;
    const fansOnly = item?.basic?.is_only_fans || content.major?.type === 'MAJOR_TYPE_BLOCKED' || content.major?.blocked;
    if (rules.charge && fansOnly) return true;
    if (!rules.words.length) return false;
    const text = dynamicText(item);
    return !!text && matchesAny(rules.words, text);
  };

  const filterDynamics = (body) => {
    const rules = dynamicRules();
    if (!hasDynamicRules(rules)) return undefined;
    const response = JSON.parse(body);
    const items = response?.data?.items;
    if (!Array.isArray(items)) return undefined;

    const kept = items.filter((item) => {
      try {
        return !isUnwantedDynamic(item, rules);
      } catch {
        return true;
      }
    });
    if (kept.length === items.length) return undefined;

    if (!kept.length) kept.push(items.at(-1));
    response.data.items = kept;
    return JSON.stringify(response);
  };

  function setupDynFilter() {
    if (!(PAGE.t || PAGE.space || PAGE.www)) return;
    const FEED_API = /\/x\/polymer\/web-dynamic\/v1\/feed\/(?:all|space)\b/;
    const wanted = (url) => FEED_API.test(url) && hasDynamicRules(dynamicRules());

    hookFetch((url) => {
      if (!wanted(url)) return null;
      return {
        after: async (response) => {
          const filtered = filterDynamics(await response.clone().text());
          if (typeof filtered !== 'string') return response;
          return new W.Response(filtered, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        },
      };
    });
    hookXHR((url) => (wanted(url) ? { rewrite: filterDynamics } : null));
  }

  TABS.push(['comments', t('評論區')], ['memo', t('備註')]);

  defOpt('x.ip', true, {
    tab: 'comments',
    group: t('IP 屬地'),
    label: t('評論顯示 IP 屬地'),
    hint: t('影片、動態、專欄、番劇、直播等頁面的評論與回覆'),
    reload: true,
  });
  defOpt('x.ip.article', true, { tab: 'comments', group: t('IP 屬地'), label: t('專欄作者顯示 IP 屬地'), reload: true });
  defOpt('locationReplacements', '{}', {
    tab: 'comments',
    group: t('IP 屬地'),
    type: 'text',
    label: t('屬地文字替換'),
    hint: t('JSON 鍵值對，例如 {"IP属地：":""} 可去掉前綴'),
  });
  defOpt('x.gender', true, {
    tab: 'comments',
    group: t('用戶標記'),
    label: t('評論顯示性別'),
    hint: t('資料來自評論介面，未公開性別的用戶不顯示'),
    reload: true,
  });

  const addMarkStyle = (shadowRoot) => {
    if (!shadowRoot || shadowRoot.querySelector('style[data-bga-style]')) return;
    const style = document.createElement('style');
    style.dataset.bgaStyle = 'marks';
    style.textContent = STYLES.marks;
    shadowRoot.appendChild(style);
  };

  const locationReplacements = (() => {
    let source = null;
    let pairs = [];
    return () => {
      const text = val('locationReplacements') || '{}';
      if (text === source) return pairs;
      source = text;
      try {
        pairs = Object.entries(JSON.parse(text));
      } catch {
        pairs = [];
        warn(t('屬地文字替換不是合法 JSON，已忽略'));
      }
      return pairs;
    };
  })();

  const locationOf = (reply) => {
    let text = reply?.reply_control?.location;
    if (!text) return '';
    for (const [from, to] of locationReplacements()) text = text.replaceAll(from, String(to));
    return text;
  };

  const showCommentLocation = () => {
    hookLit('bili-comment-action-buttons-renderer', (el) => {
      const pubdate = el.shadowRoot?.querySelector('#pubdate');
      if (!pubdate) return;
      const text = locationOf(el.data);
      let node = el.shadowRoot.querySelector('#location');
      if (!text) return void node?.remove();
      if (!node) {
        node = h('div', { id: 'location' });
        pubdate.insertAdjacentElement('afterend', node);
      }
      if (node.textContent !== text) node.textContent = text;
    });
  };

  const showCommentGender = () => {
    hookLit('bili-comment-user-info', (el) => {
      const info = el.shadowRoot?.querySelector('#info');
      const member = el.data?.member;
      if (!info || !member) return;
      addMarkStyle(el.shadowRoot);
      let mark = info.querySelector('.bga-gender');
      const male = member.sex === '男';
      if (!male && member.sex !== '女') return void mark?.remove();
      if (!mark) {
        mark = h('span', { class: 'bga-gender' });
        const name = info.querySelector('#user-name');
        if (name) name.insertAdjacentElement('afterend', mark);
        else info.appendChild(mark);
      }
      mark.textContent = male ? '♂' : '♀';
      mark.dataset.s = male ? 'm' : 'f';
      mark.title = t`性別：${male ? t('男') : t('女')}`;
    });
  };

  const stampLocation = (html, location, inline) => {
    const opening = `<span class="${inline ? 'time' : 'reply-time'}">`;
    const start = html.indexOf(opening);
    if (start < 0) return html;
    const closing = '</span>';
    const end = html.indexOf(closing, start + opening.length);
    if (end < 0) return html;
    if (inline) return `${html.slice(0, end)}&nbsp;&nbsp;${location}${html.slice(end)}`;
    const after = end + closing.length;
    return `${html.slice(0, after)}<span class="reply-location">${location}</span>${html.slice(after)}`;
  };

  const showLegacyCommentLocation = () => {
    const inline = PAGE.www && PATH !== '/blackboard/feed-topic.html';
    onGlobal('bbComment', (bbComment) => {
      const proto = bbComment?.prototype;
      if (!proto || proto.__bgaPatched) return;
      proto.__bgaPatched = true;
      for (const builder of ['_createListCon', '_createSubReplyItem']) {
        const native = proto[builder];
        if (typeof native !== 'function') continue;
        proto[builder] = function (item, ...rest) {
          const html = native.call(this, item, ...rest);
          try {
            const location = locationOf(item).replace(/[<>&]/g, '');
            return location && typeof html === 'string' ? stampLocation(html, location, inline) : html;
          } catch {
            return html;
          }
        };
      }
    });
  };

  const ARTICLE_INFO_API = 'https://api.bilibili.com/x/article/viewinfo';
  const articleLocation = async (articleId) => {
    try {
      const response = await fetch(`${ARTICLE_INFO_API}?id=${articleId}`, { credentials: 'include' });
      return (await response.json())?.data?.location || '';
    } catch {
      return '';
    }
  };

  const showReadPageLocation = async (articleId) => {
    const location = await articleLocation(articleId);
    if (!location) return;
    const published = await waitFor(() => document.querySelector('.article-detail .publish-text'), '专栏发布时间').catch(
      () => null,
    );
    if (!published || published.parentElement?.querySelector('.bga-article-location')) return;
    published.insertAdjacentElement('afterend', h('span', { class: 'bga-article-location' }, `${location} · `));
  };

  const showOpusPageLocation = () => {
    onGlobal('__INITIAL_STATE__', async (state) => {
      const basic = state?.detail?.basic;
      const isArticle = basic?.article_type === 0;
      if (!basic?.rid_str || !isArticle) return;
      const location = await articleLocation(basic.rid_str);
      if (!location) return;
      const text = `${location} · `;
      const paint = () => {
        const published = document.querySelector('.opus-module-author__pub');
        if (!published) return;
        let node = published.querySelector('.bga-article-location');
        if (!node) {
          node = h('span', { class: 'bga-article-location' });
          published.prepend(node);
        }
        if (node.textContent !== text) node.textContent = text;
      };
      await bodyReady();
      new MutationObserver(paint).observe(document.body, { childList: true, subtree: true });
      paint();
    });
  };

  function setupComments() {
    if (IS_TOP) addStyle(STYLES.marks, 'marks');

    if (val('x.ip')) {
      showCommentLocation();
      const hasLegacyComments = PAGE.t || (PAGE.www && /^\/(blackboard|blackroom)\//.test(PATH));
      if (hasLegacyComments) showLegacyCommentLocation();
    }
    if (val('x.gender')) showCommentGender();

    if (val('x.ip.article') && IS_TOP) {
      const articleId = PAGE.read && PATH.match(/\/cv(\d+)/)?.[1];
      if (articleId) showReadPageLocation(articleId);
      else if (PAGE.read || PAGE.opus) showOpusPageLocation();
    }
  }

  defOpt('x.memo', true, {
    tab: 'memo',
    group: t('顯示'),
    label: t('顯示用戶備註'),
    hint: t('評論區用戶名旁、空間頁，以及頁面上指向該用戶空間首頁的連結'),
    reload: true,
  });
  defOpt('x.memo.mode', 'after', {
    tab: 'memo',
    group: t('顯示'),
    type: 'select',
    label: t('顯示方式'),
    choices: [
      ['after', t('暱稱後加標籤')],
      ['replace', t('只顯示備註')],
    ],
  });

  const memo = {
    map: new Map(),

    list() {
      const users = store.get('biliUsers', []);
      return Array.isArray(users) ? users : [];
    },

    refresh() {
      memo.map = new Map(
        memo
          .list()
          .filter((user) => user?.id && user.memo)
          .map((user) => [String(user.id), user]),
      );
    },
    get(uid) {
      return memo.map.get(String(uid))?.memo || '';
    },

    set(uid, text, nickname = '', avatar = '') {
      const id = String(uid);
      const previous = memo.map.get(id);
      const users = memo.list().filter((user) => String(user.id) !== id);
      if (text) {
        users.unshift({
          id,
          nickname: nickname || previous?.nickname || '',
          avatar: avatar || previous?.avatar || '',
          memo: text,
        });
      }
      store.set('biliUsers', users);
    },

    edit(uid, nickname = '', avatar = '', anchor = null) {
      document.getElementById('bga-memo-pop')?.remove();
      const current = memo.get(uid);
      const input = h('input', {
        type: 'text',
        maxlength: '40',
        placeholder: t('輸入備註'),
        value: current,
        'aria-label': t('備註'),
      });
      const close = () => popover.hidePopover();
      const save = () => {
        const text = input.value.trim();
        if (text !== current) {
          memo.set(uid, text, nickname, avatar);
          toast(text ? t('備註已儲存') : t('備註已刪除'), 'ok', 1800);
        }
        close();
      };
      const remove = () => {
        input.value = '';
        save();
      };
      const popover = h(
        'div',
        { id: 'bga-memo-pop', class: 'bga-ui', popover: 'auto', role: 'dialog', 'aria-label': t('編輯備註') },
        h('div', { class: 'bga-mp-title' }, t('備註'), h('span', {}, nickname || `UID ${uid}`)),
        input,
        h(
          'div',
          { class: 'bga-mp-btns' },
          current ? h('button', { type: 'button', class: 'bga-mp-del', onclick: remove }, t('刪除')) : null,
          h('button', { type: 'button', onclick: close }, t('取消')),
          h('button', { type: 'button', class: 'bga-mp-ok', onclick: save }, t('儲存')),
        ),
      );
      popover.dataset.accent = val('x.ui.accent');
      popover.dataset.theme = val('x.ui.theme');
      popover.addEventListener('toggle', (event) => {
        if (event.newState === 'closed') popover.remove();
      });

      input.addEventListener('keydown', (event) => {
        event.stopPropagation();
        if (event.key === 'Enter') save();
      });
      for (const type of ['keyup', 'keypress']) input.addEventListener(type, (event) => event.stopPropagation());

      document.body.appendChild(popover);
      popover.showPopover();
      placeNear(popover, anchor);
      input.focus();
      input.select();
    },
  };

  const placeNear = (popover, anchor) => {
    const width = popover.offsetWidth;
    const height = popover.offsetHeight;
    const MARGIN = 8;
    let rect = null;
    if (anchor?.getBoundingClientRect) rect = anchor.getBoundingClientRect();
    else if (anchor?.clientX != null)
      rect = { left: anchor.clientX, top: anchor.clientY - 10, bottom: anchor.clientY + 10 };

    let x = (window.innerWidth - width) / 2;
    let y = (window.innerHeight - height) / 2;
    if (rect) {
      x = Math.min(Math.max(MARGIN, rect.left), window.innerWidth - width - MARGIN);
      const fitsBelow = rect.bottom + MARGIN + height <= window.innerHeight;
      y = fitsBelow ? rect.bottom + MARGIN : Math.max(MARGIN, rect.top - height - MARGIN);
    }
    popover.style.left = `${Math.round(x)}px`;
    popover.style.top = `${Math.round(y)}px`;
  };

  const memoBadge = (text) => h('span', { class: 'bga-memo', title: t('點擊修改備註') }, text);

  const showCommentMemo = () => {
    hookLit('bili-comment-user-info', (el) => {
      const info = el.shadowRoot?.querySelector('#info');
      const member = el.data?.member;
      if (!info || !member) return;
      addMarkStyle(el.shadowRoot);
      const name = info.querySelector('#user-name');
      const text = memo.get(member.mid || '');
      let badge = info.querySelector('.bga-memo');
      let adder = info.querySelector('.bga-memo-add');

      const onEdit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const current = el.data?.member;
        if (current) memo.edit(String(current.mid), current.uname, current.avatar, event);
      };

      if (text) {
        adder?.remove();
        if (!badge) {
          badge = memoBadge(text);
          badge.addEventListener('click', onEdit);
          if (name) name.insertAdjacentElement('afterend', badge);
          else info.appendChild(badge);
        }
        if (badge.textContent !== text) badge.textContent = text;
      } else {
        badge?.remove();
        if (!adder) {
          adder = h('span', { class: 'bga-memo-add', title: t('給這位用戶加備註') }, t('備註'));
          adder.addEventListener('click', onEdit);
          info.appendChild(adder);
        }
      }
      if (name) name.style.display = text && val('x.memo.mode') === 'replace' ? 'none' : '';
    });

    const rerender = () => {
      for (const el of deepQueryAll('bili-comment-user-info')) {
        try {
          el.requestUpdate?.();
        } catch {
        }
      }
    };
    store.on('biliUsers', () => {
      memo.refresh();
      rerender();
      scanMemoLinks();
    });
    store.on('x.memo.mode', rerender);
  };

  const SPACE_HOME = /space\.bilibili\.com\/(\d+)\/?(?:[?#]|$)/;

  function scanMemoLinks() {
    if (!document.body) return;
    for (const badge of document.querySelectorAll('.bga-memo[data-bga-link]')) {
      if (!memo.get(badge.dataset.bgaLink)) badge.remove();
    }
    if (!memo.map.size) return;

    for (const link of document.querySelectorAll('a[href*="space.bilibili.com/"]')) {
      const uid = link.href.match(SPACE_HOME)?.[1];
      const user = uid && memo.map.get(uid);
      if (!user) continue;

      const isOwnUi = link.closest('#bga-panel, #bga-memo-pop');
      const isImageLink = link.querySelector('img, picture, svg, .bili-avatar');
      if (isOwnUi || isImageLink || !link.textContent.trim()) continue;

      const next = link.nextElementSibling;
      if (next?.classList.contains('bga-memo')) {
        if (next.textContent !== user.memo) next.textContent = user.memo;
        continue;
      }
      const badge = memoBadge(user.memo);
      badge.dataset.bgaLink = uid;
      badge.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const latest = memo.map.get(uid);
        memo.edit(uid, latest?.nickname, latest?.avatar, event);
      });
      link.insertAdjacentElement('afterend', badge);
    }
  }

  const spaceUid = () => (location.origin + location.pathname).match(/space\.bilibili\.com\/(\d+)(?:\/|$)/)?.[1];

  const spaceNameRow = async () => {
    const header = await waitFor(() => document.querySelector('#biliMainHeader'), '顶栏', 20000);
    const isNewLayout = header.tagName === 'HEADER';
    const card = await waitFor(
      () => document.querySelector(isNewLayout ? '#app .upinfo__main' : '#app .h-inner'),
      'UP 主信息',
      20000,
    );
    return card.querySelector(isNewLayout ? '.upinfo-detail__top' : '.h-basic div');
  };

  const showSpaceMemo = async () => {
    const uid = spaceUid();
    const row = uid && (await spaceNameRow());
    if (!row) return;
    const nickname = () => {
      const shown = row.querySelector('.nickname, #h-name')?.textContent;
      return (shown || document.title.replace(/的个人空间.*$/, '')).trim();
    };
    const button = row.appendChild(h('button', { type: 'button', class: 'bga-pill bga-space-memo' }));
    const paint = () => {
      const text = memo.get(uid);
      button.textContent = text ? t`備註：${text}` : t('＋ 備註');
    };
    button.addEventListener('click', () => memo.edit(uid, nickname(), '', button));
    store.on('biliUsers', () => {
      memo.refresh();
      paint();
    });
    paint();
  };

  function setupMemo() {
    memo.refresh();

    platform.ready.then(() => memo.refresh());
    if (!val('x.memo')) return;

    showCommentMemo();
    if (!IS_TOP) return;
    if (PAGE.space) ready().then(() => showSpaceMemo().catch(() => {}));
    bodyReady().then(() => {
      scanMemoLinks();

      let pending = 0;
      pageObserver(() => {
        if (!memo.map.size || pending) return;
        pending = setTimeout(() => {
          pending = 0;
          scanMemoLinks();
        }, 500);
      }).observe(document.body, { childList: true, subtree: true });
    });
  }

  defOpt('x.cmt.block', false, {
    tab: 'comments',
    group: t('評論過濾'),
    label: t('評論區快速拉黑'),
    hint: t(
      '滑鼠移到評論的用戶名那一行，出現「拉黑」；點一下加入 B站黑名單並收起他的評論；誤點的話到 B站的「黑名單」裡移除。需要已登入',
    ),
  });
  defOpt('x.cmt.words', '', {
    tab: 'comments',
    group: t('評論過濾'),
    type: 'text',
    keep: true,
    label: t('評論含有這些詞就隱藏'),
    hint: t('留空 = 不啟用。每行一個詞；也可以寫 /正則/。評論和樓中樓回覆都會比對'),
    placeholder: t('加微信\n/私信.{0,4}领取/'),
  });

  defOpt('x.cmt.noGoods', false, {
    tab: 'comments',
    group: t('評論過濾'),
    label: t('隱藏帶貨評論'),
    hint: t('評論裡帶有商品連結（藍色的購物車連結）就整條收起，常見於 UP 主置頂的工商廣告'),
  });

  function setupCommentFilter() {
    const blockedHere = new Map();
    let patterns = [];

    const shouldHide = (reply) => {
      if (!reply) return false;
      if (blockedHere.has(String(reply.member?.mid ?? reply.mid ?? ''))) return true;
      const text = reply.content?.message || '';
      return patterns.length > 0 && !!text && matchesAny(patterns, text);
    };

    const applyTo = (el) => {
      const hide = el.hasAttribute('data-bga-goods') || shouldHide(el.data);
      if (hide !== el.hasAttribute('data-bga-hidden')) {
        el.toggleAttribute('data-bga-hidden', hide);
        el.style.display = hide ? 'none' : '';
      }
    };
    const COMMENT_TAGS = ['bili-comment-thread-renderer', 'bili-comment-reply-renderer'];
    for (const tag of COMMENT_TAGS) hookLit(tag, applyTo);
    const reapply = () => {
      for (const tag of COMMENT_TAGS) deepQueryAll(tag).forEach((el) => safe(() => applyTo(el), '评论过滤'));
    };

    const hasGoodsLink = (thread) => {
      const main = thread.shadowRoot?.querySelector('bili-comment-renderer')?.shadowRoot;
      if (!main) return false;
      return deepQueryAll('bili-rich-text', main).some((richText) =>
        richText.shadowRoot?.querySelector('a[data-type="goods"]'),
      );
    };
    const checkGoods = (comment) => {
      const hasGoods = !!val('x.cmt.noGoods') && hasGoodsLink(comment);
      if (hasGoods === comment.hasAttribute('data-bga-goods')) return;
      comment.toggleAttribute('data-bga-goods', hasGoods);
      applyTo(comment);
    };
    hookLit('bili-comment-thread-renderer', (thread) => {
      if (!val('x.cmt.noGoods') && !thread.hasAttribute('data-bga-goods')) return;
      for (const delay of [0, 600, 2000]) setTimeout(() => safe(() => checkGoods(thread), '带货评论'), delay);
    });
    store.on('x.cmt.noGoods', () => {
      for (const thread of deepQueryAll('bili-comment-thread-renderer')) safe(() => checkGoods(thread), '带货评论');
    });

    watch('x.cmt.words', (text) => {
      patterns = parseWordList(text);
      if (document.body) reapply();
    });

    const toggleBlock = async (uid, name, block) => {
      if (!loginCsrf()) return void toast(t('要先登入 B站才能拉黑'), 'warn');
      try {
        await setUserBlocked(uid, block);
        if (block) blockedHere.set(uid, name);
        else blockedHere.delete(uid);
        reapply();
        toast(block ? t`已拉黑「${name || uid}」，他的評論已收起` : t`已取消拉黑「${name || uid}」`, 'ok', 3200);
      } catch (error) {
        toast(t`拉黑失敗：${error.message || error}`, 'warn');
      }
    };
    hookLit('bili-comment-user-info', (el) => {
      const info = el.shadowRoot?.querySelector('#info');
      if (!info) return;
      let button = info.querySelector('.bga-cmt-block');
      if (!val('x.cmt.block')) return void button?.remove();
      if (button) return;
      addMarkStyle(el.shadowRoot);
      button = h('span', { class: 'bga-cmt-block', title: t('加入 B站黑名單') }, t('拉黑'));
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const member = el.data?.member;
        if (member?.mid) toggleBlock(String(member.mid), member.uname, true);
      });
      info.appendChild(button);
    });
    store.on('x.cmt.block', () => {
      for (const el of deepQueryAll('bili-comment-user-info')) el.requestUpdate?.();
    });
  }

  defOpt('x.live.noMcdn', true, { tab: 'live', group: t('畫質'), label: t('直播停用 P2P / 第三方 CDN'), reload: true });
  defOpt('x.live.forceHighest', false, {
    tab: 'live',
    group: t('畫質'),
    label: t('強制最高畫質（真・原畫）'),
    hint: t('連續載入失敗時會自動退回播放器選擇的畫質'),
    reload: true,
  });
  defOpt('x.live.noGiftFull', true, {
    tab: 'live',
    group: t('介面'),
    label: t('網頁全屏 / 全屏時隱藏禮物欄'),
    hint: t('滑鼠移到畫面底部時不再彈出禮物列'),
  });
  defOpt('x.live.noGift', false, {
    tab: 'live',
    group: t('介面'),
    label: t('平時也隱藏禮物欄'),
    hint: t('播放器下方整條禮物 / 包裹列'),
  });
  defOpt('x.live.noRank', true, {
    tab: 'live',
    group: t('介面'),
    label: t('隱藏榜單'),
    hint: t('聊天區上方的高能榜 / 大航海、標題列的人氣榜、禮物星球等入口'),
  });
  defOpt('x.live.noAds', true, {
    tab: 'live',
    group: t('介面'),
    label: t('隱藏直播區廣告與活動'),
    hint: t('播放器下方的活動輪播、分區頁橫幅、小橙車、活動入口、播放器內的活動浮層'),
  });
  defOpt('x.live.cleanUI', true, {
    tab: 'live',
    group: t('介面'),
    label: t('隱藏直播間雜項'),
    hint: t('進場歡迎條、播放器角標'),
  });
  defOpt('x.live.noSidebar', true, {
    tab: 'live',
    group: t('介面'),
    label: t('隱藏直播間右側的浮動按鈕'),
    hint: t('貼在視窗右邊的「實驗室」「關注」那一條'),
  });
  defOpt('x.live.fill', true, {
    tab: 'live',
    group: t('版面'),
    label: t('直播畫面鋪滿頁面'),
    hint: t('去掉左右留白：畫面佔滿聊天欄以外的寬度和導航欄以下的高度，主播資訊浮在畫面上（滑鼠移到畫面才顯示），禮物欄往下捲才看得到。不是網頁全螢幕，頁面照常捲動'),
  });
  defOpt('x.live.sendCheck', true, {
    tab: 'live',
    group: t('彈幕'),
    label: t('檢查彈幕是否真的發出'),
    hint: t('B站對被攔截的彈幕也回報「成功」；這裡會提示是系統攔截還是主播屏蔽詞'),
    reload: true,
  });
  defOpt('autoCopy', true, {
    tab: 'live',
    group: t('彈幕'),
    label: t('被攔截時自動複製內容'),
    hint: t('方便修改後重發'),
  });
  defOpt('x.live.sendOkToast', false, { tab: 'live', group: t('彈幕'), label: t('發送成功也提示') });

  const LIVE_P2P_NODE = /[xy0-9]+\.mcdn\.bilivideo\.cn:\d+/;

  const LIVE_PROXY_PREFIX = /[\w.]+\.smtcdns\.net\/(?=[\w-]+\.bilivideo\.com\/)/;

  const LIVE_QUALITY_SUFFIX = /(live-bvc\/\d+\/live_\d+_\d+)_\w+/;
  const LIVE_HEVC_SUFFIX = /(\d+)_(?:mini|pro)hevc/g;

  const toSourceStream = (url) => {
    if (!LIVE_QUALITY_SUFFIX.test(url)) return url;
    return url.replace(LIVE_QUALITY_SUFFIX, '$1').replace(LIVE_HEVC_SUFFIX, '$1');
  };

  function tuneLiveStream() {
    const avoidP2P = val('x.live.noMcdn');
    let forceSource = val('x.live.forceHighest');
    if (!avoidP2P && !forceSource) return;

    let failures = 0;
    setInterval(() => {
      failures = Math.floor(failures / 2);
    }, 10000);
    const noteFailure = () => {
      failures += 1;
      if (failures < 5 || !forceSource) return;
      failures = 0;
      forceSource = false;
      toast(t('最高畫質不可用，已退回播放器選擇的畫質'), 'warn');
    };

    hookFetch((url) => {
      if (avoidP2P && LIVE_P2P_NODE.test(url)) return { block: 'reject' };
      let target = url;
      if (avoidP2P) target = target.replace(LIVE_PROXY_PREFIX, '');
      if (forceSource) target = toSourceStream(target);
      const isSegment = /\.(?:m3u8|m4s)/.test(url);
      return {
        url: target === url ? undefined : target,
        after:
          forceSource && isSegment
            ? (response) => {
                if (response.status === 403 || response.status === 404) noteFailure();
              }
            : undefined,
      };
    });
  }

  const BLOCKED_REASONS = {
    f: t('系統攔截（全站敏感詞）'),
    k: t('主播 / 房管屏蔽詞'),
  };

  const sentDanmakuText = (result) => {
    try {
      return JSON.parse(result?.data?.mode_info?.extra || '{}').content || '';
    } catch {
      return '';
    }
  };

  function checkDanmakuSend() {
    const SEND_API = 'api.live.bilibili.com/msg/send';
    hookFetch((url) => {
      if (!url.includes(SEND_API)) return null;
      return {
        after: async (response) => {
          const result = await response.clone().json();
          if (result.code !== 0) {
            toast(t`彈幕發送失敗：${result.message || result.msg || result.code}`, 'warn');
            return response;
          }
          const reason = BLOCKED_REASONS[result.msg];
          if (!reason) {
            if (val('x.live.sendOkToast')) toast(t('彈幕已發出'), 'ok', 1800);
            return response;
          }
          const text = sentDanmakuText(result);
          const copied = val('autoCopy') && text && copyNow(text);
          toast(t`彈幕沒有發出：${reason}${copied ? t(' · 內容已複製') : ''}`, 'warn', 4500);

          const failed = { ...result, code: -101, message: reason };
          return new W.Response(JSON.stringify(failed), { status: response.status, headers: response.headers });
        },
      };
    });
  }

  function setupLive() {
    if (!PAGE.live) return;
    reflect('x.live.cleanUI', 'live-clean');
    reflect('x.live.noSidebar', 'live-no-sidebar');
    reflect('x.live.fill', 'live-fill');
    reflect('x.live.noRank', 'live-no-rank');
    reflect('x.live.noAds', 'live-no-ads');
    reflect('x.live.noGift', 'live-no-gift');
    reflect('x.live.noGiftFull', 'live-no-gift-full');
    tuneLiveStream();
    if (val('x.live.sendCheck')) checkDanmakuSend();
  }

  TABS.push(['danmaku', t('彈幕查詢')]);

  const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let value = n;
      for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      table[n] = value;
    }
    return table;
  })();

  const dm = {
    cache: new Map(),

    crc(text) {
      let register = 0xffffffff;
      for (let i = 0; i < text.length; i++)
        register = (register >>> 8) ^ CRC_TABLE[(register ^ text.charCodeAt(i)) & 0xff];
      return register >>> 0;
    },

    async crack(hash, limit = 1e8, signal = { cancelled: false }) {
      if (dm.cache.has(hash)) return dm.cache.get(hash);
      const target = parseInt(hash, 16);
      if (Number.isNaN(target)) return '';
      const found = (uid) => {
        dm.cache.set(hash, uid);
        return uid;
      };

      let remainder = (target ^ 0xffffffff) >>> 0;
      const steps = [0, 0, 0, 0];
      for (let i = 3; i >= 0; i--) {
        const topByte = remainder >>> (i * 8);
        const index = CRC_TABLE.findIndex((entry) => entry >>> 24 === topByte);
        if (index < 0) return '';
        steps[3 - i] = index;
        remainder = (remainder ^ (CRC_TABLE[index] >>> ((3 - i) * 8))) >>> 0;
      }

      const lastThreeDigits = (prefix) => {
        let register = dm.crc(prefix);
        let digits = '';
        for (const step of [2, 1, 0]) {
          const code = (register & 0xff) ^ steps[step];
          if (code < 48 || code > 57) return null;
          digits += code - 48;
          register = (CRC_TABLE[steps[step]] ^ (register >>> 8)) >>> 0;
        }
        return digits;
      };

      for (let n = 0; n < 1000; n++) {
        if ((dm.crc(String(n)) ^ 0xffffffff) >>> 0 === target >>> 0) return found(String(n));
      }

      let prefix = 0;
      while (prefix < limit) {
        if (signal.cancelled) return '';
        const sliceEnd = Math.min(prefix + 400000, limit);
        for (; prefix < sliceEnd; prefix++) {
          const text = String(prefix);

          let register = 0xffffffff;
          let index = 0;
          for (let i = 0; i < text.length; i++) {
            index = (register ^ text.charCodeAt(i)) & 0xff;
            register = (register >>> 8) ^ CRC_TABLE[index];
          }
          if (index !== steps[3]) continue;
          const tail = lastThreeDigits(text);
          if (tail !== null) return found(text + tail);
        }
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      return found('');
    },

    async getText(url) {
      try {
        const response = await fetch(url, { credentials: 'include' });
        if (response.ok) return await response.text();
      } catch {
      }
      return (await platform.request({ url })).text;
    },
    async getJSON(url) {
      return JSON.parse(await dm.getText(url));
    },

    async cid() {
      const state = W.__INITIAL_STATE__;
      if (PAGE.bangumi && state?.epInfo?.cid) return state.epInfo.cid;
      const query = new URLSearchParams(location.search);
      const bvid =
        location.pathname.match(/\/video\/(BV[0-9A-Za-z]+)/)?.[1] ||
        query.get('bvid') ||
        state?.videoData?.bvid ||
        state?.bvid;
      if (!bvid) throw new Error(t('這個頁面找不到影片 BV 號'));
      const pages = (await dm.getJSON(`https://api.bilibili.com/x/player/pagelist?bvid=${bvid}`))?.data;
      if (!Array.isArray(pages) || !pages.length) throw new Error(t('取得分 P 列表失敗'));
      const part = Math.max(1, parseInt(query.get('p') || state?.p || '1', 10) || 1);
      return (pages[part - 1] || pages[0]).cid;
    },

    async search(keyword) {
      const cid = await dm.cid();
      const xml = await dm.getText(`https://api.bilibili.com/x/v1/dm/list.so?oid=${cid}`);
      const needle = (keyword || '').toLowerCase();
      const results = [];
      for (const node of new DOMParser().parseFromString(xml, 'text/xml').getElementsByTagName('d')) {
        const text = node.textContent || '';
        if (needle && !text.toLowerCase().includes(needle)) continue;

        const fields = (node.getAttribute('p') || '').split(',');
        results.push({
          second: parseFloat(fields[0]) || 0,
          ts: (parseInt(fields[4], 10) || 0) * 1000,
          hash: fields[6] || '',
          text,
        });
      }
      return results.sort((a, b) => a.second - b.second);
    },

    fmt(seconds) {
      const total = Math.max(0, Math.floor(seconds));
      const two = (n) => String(n).padStart(2, '0');
      const hours = Math.floor(total / 3600);
      const clock = `${two(Math.floor((total % 3600) / 60))}:${two(total % 60)}`;
      return hours ? `${two(hours)}:${clock}` : clock;
    },
  };

  defOpt('x.rate.remember', true, {
    tab: 'video',
    group: t('播放'),
    label: t('記住倍速'),
    hint: t('換影片、重新整理後沿用上次調的倍速'),
  });
  defOpt('x.dm.default', 'keep', {
    tab: 'video',
    group: t('播放'),
    type: 'select',
    label: t('彈幕預設'),
    choices: [
      ['keep', t('不變')],
      ['on', t('開')],
      ['off', t('關')],
    ],
  });
  defOpt('x.sub.default', 'keep', {
    tab: 'video',
    group: t('播放'),
    type: 'select',
    label: t('字幕預設'),
    hint: t('影片有字幕時才有作用'),
    choices: [
      ['keep', t('不變')],
      ['on', t('開')],
      ['off', t('關')],
    ],
  });
  defOpt('x.seek.step', 5, { tab: 'video', group: t('播放'), label: t('快退 / 快進的秒數'), unit: t('秒'), step: 1 });
  defOpt('x.wheelVolume', true, {
    tab: 'video',
    group: t('播放'),
    label: t('全螢幕時滾輪調音量'),
    hint: t('滑鼠在畫面上滾動，每格 5%'),
  });
  defOpt('x.end.exitFs', false, {
    tab: 'video',
    group: t('播放'),
    label: t('播完自動退出全螢幕'),
    hint: t('後面沒有接著播下一個影片時才退出'),
  });
  defOpt('x.shot.copy', false, {
    tab: 'video',
    group: t('播放'),
    label: t('截圖同時複製到剪貼簿'),
    hint: t('截圖一律會下載成 PNG；這項再多複製一份'),
  });
  defOpt('x.loud', false, {
    tab: 'video',
    group: t('播放'),
    label: t('響度均衡'),
    hint: t('把太大聲的地方壓低、整體音量拉高，各影片聽起來差不多大聲。如果開了以後沒聲音，關掉並重新整理'),
    reload: true,
  });
  defOpt('x.pod.order', 'normal', {
    tab: 'video',
    group: t('選集'),
    type: 'select',
    label: t('合集播放順序'),
    hint: t('一集播完後接著播哪一集'),
    choices: [
      ['normal', t('正常')],
      ['reverse', t('倒序')],
      ['random', t('隨機')],
    ],
  });
  defOpt('x.cleanShare', true, {
    tab: 'clean',
    group: t('隱私'),
    label: t('複製連結時去掉追蹤參數'),
    hint: t('B站「分享 → 複製連結」得到的網址不再帶 vd_source、share_source 等'),
  });

  const mainVideo = () => document.querySelector('#bilibili-player video:not(.bga-fs-decoy)');
  const hasPlayer = () => PAGE.www && !!document.querySelector('#bilibili-player video');

  const biliPlayer = () => {
    try {
      return W.player || null;
    } catch {
      return null;
    }
  };
  const currentBvid = () => location.pathname.match(BVID_IN_URL)?.[1] || W.__INITIAL_STATE__?.bvid || '';

  const currentPart = () => new URLSearchParams(location.search).get('p') || '';
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  let rateQuietUntil = 0;

  const setRate = (rate) => {
    const video = mainVideo();
    if (!video) return;
    rateQuietUntil = Date.now() + 600;
    try {
      biliPlayer()?.setPlaybackRate?.(rate);
    } catch {
    }
    if (Math.abs(video.playbackRate - rate) > 0.001) video.playbackRate = rate;
  };

  const stepRate = (delta) => {
    const video = mainVideo();
    if (!video) return;
    const rate = delta === 0 ? 1 : clamp(Math.round((video.playbackRate + delta) * 100) / 100, 0.25, 4);
    setRate(rate);
    if (val('x.rate.remember')) store.set('x.rate.value', rate);
    toast(t`倍速 ${rate}×`, 'info', 1200, 'rate');
  };

  const pauseVideo = (video) => {
    try {
      const player = biliPlayer();
      if (player?.pause) player.pause();
      else video.pause();
    } catch {
      video.pause();
    }
  };
  const playVideo = (video) => {
    try {
      const player = biliPlayer();
      if (player?.play) player.play();
      else video.play();
    } catch {
      video.play();
    }
  };
  const togglePlay = () => {
    const video = mainVideo();
    if (!video) return;
    if (video.paused) playVideo(video);
    else pauseVideo(video);
  };

  const seekBy = (seconds) => {
    const video = mainVideo();
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = clamp(video.currentTime + seconds, 0, Math.max(0, video.duration - 0.05));
  };

  const stepFrame = (direction) => {
    const video = mainVideo();
    if (!video) return;
    if (!video.paused) pauseVideo(video);
    seekBy(direction / 30);
  };

  const screenshot = async () => {
    const video = mainVideo();
    if (!video?.videoWidth) return void toast(t('影片還沒載入，無法截圖'), 'warn', 2000);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      const pendingBlob = new Promise((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error(t('無法取得畫面')))), 'image/png');
      });

      let pendingCopy = null;
      if (val('x.shot.copy')) {
        try {
          pendingCopy = navigator.clipboard.write([new W.ClipboardItem({ 'image/png': pendingBlob })]);
        } catch {
        }
      }

      const second = Math.floor(video.currentTime);
      const stamp = `${String(Math.floor(second / 60)).padStart(2, '0')}m${String(second % 60).padStart(2, '0')}s`;
      const title = document.title.replace(/_哔哩哔哩.*$/, '').slice(0, 60);
      saveBlob(await pendingBlob, `${title} ${currentBvid()} ${stamp}`, 'png');

      const copied = pendingCopy
        ? await pendingCopy.then(
            () => true,
            () => false,
          )
        : false;
      const size = `${canvas.width}×${canvas.height}`;
      toast(copied ? t`截圖已保存並複製（${size}）` : t`截圖已保存（${size}）`, 'ok', 1800);
    } catch (error) {
      toast(t`截圖失敗：${error.message || error}`, 'warn');
    }
  };

  const turn = { degrees: 0, mirrored: false };

  const applyTurn = () => {
    const video = mainVideo();

    let scale = 1;
    if (turn.degrees % 180 && video?.videoWidth) {
      const box = video.parentElement.getBoundingClientRect();
      const fit = Math.min(box.width / video.videoWidth, box.height / video.videoHeight);
      const shownWidth = video.videoWidth * fit;
      const shownHeight = video.videoHeight * fit;
      scale = Math.min(box.width / shownHeight, box.height / shownWidth);
    }
    const active = turn.degrees !== 0 || turn.mirrored;
    const transform = `rotate(${turn.degrees}deg) scale(${scale.toFixed(4)})${turn.mirrored ? ' scaleX(-1)' : ''}`;
    setRootVar('--bga-turn', active ? transform : null);
    flag('turned', active);
  };
  const resetTurn = () => {
    if (!turn.degrees && !turn.mirrored) return;
    turn.degrees = 0;
    turn.mirrored = false;
    applyTurn();
  };
  const rotateVideo = () => {
    turn.degrees = (turn.degrees + 90) % 360;
    applyTurn();
    toast(turn.degrees ? t`畫面旋轉 ${turn.degrees}°` : t('畫面旋轉：還原'), 'info', 1200, 'turn');
  };
  const mirrorVideo = () => {
    turn.mirrored = !turn.mirrored;
    applyTurn();
    toast(turn.mirrored ? t('畫面鏡像：開') : t('畫面鏡像：關'), 'info', 1200, 'turn');
  };

  const copyCleanLink = () => {
    const bvid = currentBvid();
    const part = currentPart();
    const url = bvid
      ? `https://www.bilibili.com/video/${bvid}/${part && part !== '1' ? `?p=${part}` : ''}`
      : cleanUrl(location.href).replace(/#.*$/, '');
    const copied = copyNow(url);
    toast(copied ? t('已複製乾淨連結') : t('複製失敗'), copied ? 'ok' : 'warn', 1500);
  };

  const addToWatchLater = async (bvid) => {
    const csrf = loginCsrf();
    if (!csrf) return void toast(t('要先登入 B站才能加入稍後再看'), 'warn');
    try {
      const response = await fetch('https://api.bilibili.com/x/v2/history/toview/add', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ bvid, csrf }).toString(),
      });
      const result = await response.json();
      if (result?.code !== 0) throw new Error(result?.message || t`錯誤碼 ${result?.code}`);
      toast(t('已加入稍後再看'), 'ok', 2000);
    } catch (error) {
      toast(t`加入稍後再看失敗：${error.message || error}`, 'warn');
    }
  };

  const addSelfToWatchLater = async () => {
    const bvid = currentBvid();
    if (bvid) await addToWatchLater(bvid);
  };

  const requestWatchLaterAll = () => {
    store.set('x.wl.req', { t: Date.now(), n: Math.random() });
    if (!PAGE.video) toast(t('已通知所有開著的影片分頁'));
  };

  ACTIONS.push({
    tab: 'video',
    group: t('稍後再看'),
    label: t('把所有開著的影片分頁加入稍後再看'),
    hint: t('每個開著影片頁的分頁各自把自己加入；需要已登入'),
    button: t('加入'),
    run: requestWatchLaterAll,
  });

  const onMainVideo = (type, handler) => {
    document.addEventListener(
      type,
      (event) => {
        if (event.target instanceof HTMLVideoElement && event.target === mainVideo()) handler(event);
      },
      true,
    );
  };
  const onFullscreenChange = (handler) => {
    for (const type of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(type, handler);
  };
  const exitFullscreen = () => {
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.webkitCancelFullScreen;
    try {
      Promise.resolve(exit?.call(document)).catch(() => {});
    } catch {
    }
  };

  function cleanCopiedLinks() {
    const BILI_LINK = /https?:\/\/[^\s"'<>，。]*(?:bilibili\.com|b23\.tv)\/[^\s"'<>，。]*/g;
    const cleanText = (text) => (typeof text === 'string' ? text.replace(BILI_LINK, (link) => cleanUrl(link)) : text);

    safe(() => {
      const clipboard = W.navigator.clipboard;
      if (!clipboard?.writeText) return;
      const nativeWrite = clipboard.writeText.bind(clipboard);
      clipboard.writeText = (text) => nativeWrite(val('x.cleanShare') ? cleanText(text) : text);
    }, '剪贴板');

    document.addEventListener(
      'copy',
      (event) => {
        if (!val('x.cleanShare') || !event.clipboardData) return;
        const field = document.activeElement;
        const inField = field && /^(TEXTAREA|INPUT)$/.test(field.tagName) && typeof field.selectionStart === 'number';
        const selected = inField
          ? field.value.slice(field.selectionStart, field.selectionEnd)
          : String(window.getSelection() || '');
        const cleaned = cleanText(selected);
        if (!selected || cleaned === selected) return;
        event.clipboardData.setData('text/plain', cleaned);
        event.preventDefault();
      },
      true,
    );
  }

  function rememberRate() {
    const applyRate = () => {
      if (!val('x.rate.remember')) return;
      const rate = Number(store.get('x.rate.value', 1));
      const video = mainVideo();
      if (video && rate > 0 && Math.abs(video.playbackRate - rate) > 0.001) setRate(rate);
    };

    onMainVideo('ratechange', ({ target: video }) => {
      if (!val('x.rate.remember') || Date.now() < rateQuietUntil) return;

      if (video.readyState < 3 || video.currentTime < 1) return;
      store.set('x.rate.value', video.playbackRate);
    });
    for (const type of ['loadstart', 'emptied']) {
      onMainVideo(type, () => {
        rateQuietUntil = Date.now() + 3000;
      });
    }

    let pending = false;
    onMainVideo('loadedmetadata', () => {
      pending = true;
      applyRate();
    });
    onMainVideo('playing', () => {
      if (!pending) return;
      pending = false;
      applyRate();
      setTimeout(applyRate, 600);
    });
    return applyRate;
  }

  const DANMAKU_SWITCH = '.bpx-player-dm-switch input.bui-danmaku-switch-input';

  const applyDanmakuDefault = () => {
    const mode = val('x.dm.default');
    const input = document.querySelector(DANMAKU_SWITCH);
    if (mode !== 'keep' && input && input.checked !== (mode === 'on')) input.click();
  };
  const applySubtitleDefault = () => {
    const mode = val('x.sub.default');
    const menu = document.querySelector('.bpx-player-ctrl-subtitle');
    if (mode === 'keep' || !menu || getComputedStyle(menu).display === 'none') return;
    const active = menu.querySelector('.bpx-player-ctrl-subtitle-language-item.bpx-state-active');
    if (mode === 'on' && !active) menu.querySelector('.bpx-player-ctrl-subtitle-language-item')?.click();
    if (mode === 'off' && active) menu.querySelector('.bpx-player-ctrl-subtitle-close-switch')?.click();
  };

  function applyDefaultsPerVideo(applyRate) {
    const videoKey = () => `${currentBvid()}|${currentPart()}|${location.pathname}`;
    let appliedKey = '';
    const applyDefaults = () => {
      const key = videoKey();
      if (key === appliedKey) {
        if (turn.degrees % 180) applyTurn();
        return;
      }
      appliedKey = key;
      resetTurn();
      safe(applyDanmakuDefault, '默认弹幕');
      safe(applySubtitleDefault, '默认字幕');
    };

    let timer = 0;
    onMainVideo('loadedmetadata', () => {
      clearTimeout(timer);
      timer = setTimeout(applyDefaults, 1500);
    });

    waitFor(() => document.querySelector(DANMAKU_SWITCH), '弹幕开关', 30000, 300)
      .then(() =>
        setTimeout(() => {
          applyDefaults();
          applyRate();
        }, 800),
      )
      .catch(() => {});
  }

  function wheelVolume() {
    const SCROLLABLE_UI = [
      '.bpx-player-control-wrap',
      '.bpx-player-sending-area',
      '.bpx-player-contextmenu',
      '.bpx-player-ending-panel',
      '.bga-pod-fs',
      '#bga-panel',
      '[class*="-menu"]',
      '[class*="setting-wrap"]',
    ].join(',');
    const STEP = 0.05;

    let accumulated = 0;
    let lastEventAt = 0;
    let lastStepAt = 0;

    const changeVolume = (video, direction) => {
      const player = biliPlayer();
      let current = video.volume;
      try {
        if (player?.getVolume) current = player.getVolume();
      } catch {
      }
      const next = clamp(Math.round((current + direction * STEP) * 100) / 100, 0, 1);
      try {
        if (player?.setVolume) player.setVolume(next);
        else video.volume = next;
        if (next > 0 && video.muted) {
          if (player?.setMuted) player.setMuted(false);
          else video.muted = false;
        }
      } catch {
        video.volume = next;
      }
      toast(t`音量 ${Math.round(next * 100)}%`, 'info', 900, 'vol');
    };

    const onWheel = (event) => {
      if (!val('x.wheelVolume') || event.ctrlKey || event.metaKey) return;
      const fullscreen = fullscreenElement();
      const target = event.target;
      const overVideo =
        fullscreen &&
        target instanceof Element &&
        fullscreen.contains(target) &&
        target.closest('.bpx-player-video-area');
      if (!overVideo || target.closest(SCROLLABLE_UI)) return;
      const video = mainVideo();
      if (!video) return;
      event.preventDefault();
      event.stopPropagation();

      const now = Date.now();
      if (now - lastEventAt > 200) accumulated = 0;
      lastEventAt = now;
      accumulated += event.deltaY;
      if (Math.abs(accumulated) < 30 || now - lastStepAt < 80) return;
      const direction = accumulated < 0 ? 1 : -1;
      accumulated = 0;
      lastStepAt = now;
      changeVolume(video, direction);
    };

    let listening = false;
    onFullscreenChange(() => {
      const wanted = !!fullscreenElement();
      if (wanted === listening) return;
      listening = wanted;
      if (wanted) document.addEventListener('wheel', onWheel, { capture: true, passive: false });
      else document.removeEventListener('wheel', onWheel, { capture: true });
    });
  }

  function afterPlaybackEnds() {
    const episodes = () =>
      [...document.querySelectorAll('.video-pod__body .simple-base-item')].filter((row) => !row.closest('.bga-pod-fs'));
    const isCurrent = (row) => row.classList.contains('active') || !!row.querySelector('.active');

    const playNextInOrder = () => {
      const order = val('x.pod.order');
      if (order === 'normal') return false;
      const rows = episodes();
      const current = rows.findIndex(isCurrent);

      if (order === 'reverse' && current === 0) return true;

      let next = -1;
      if (order === 'reverse') {
        next = current - 1;
      } else if (rows.length > 1) {
        do {
          next = Math.floor(Math.random() * rows.length);
        } while (next === current);
      }
      if (current < 0 || !rows[next]) return false;
      (rows[next].querySelector('.title') || rows[next]).click();
      return true;
    };

    onMainVideo('ended', (event) => {
      if (playNextInOrder()) {
        event.stopImmediatePropagation();
        return;
      }
      if (!val('x.end.exitFs') || !fullscreenElement()) return;

      setTimeout(() => {
        if (mainVideo()?.ended && fullscreenElement()) exitFullscreen();
      }, 1500);
    });
  }

  function normalizeLoudness() {
    const wired = new WeakSet();
    let audio = null;
    let userActed = false;

    const wire = (video) => {
      const usesMse = String(video.currentSrc || video.src || '').startsWith('blob:');
      if (!userActed || wired.has(video) || !usesMse) return;
      try {
        audio ||= new (W.AudioContext || W.webkitAudioContext)();
        if (audio.state !== 'running') {
          audio
            .resume()
            .then(() => wire(video))
            .catch(() => {});
          return;
        }
        wired.add(video);
        const compressor = audio.createDynamicsCompressor();
        compressor.threshold.value = -30;
        compressor.knee.value = 20;
        compressor.ratio.value = 6;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;
        const gain = audio.createGain();
        gain.gain.value = 1.6;
        audio.createMediaElementSource(video).connect(compressor);
        compressor.connect(gain);
        gain.connect(audio.destination);
      } catch (error) {
        wired.add(video);
        warn('响度均衡', error);
        toast(t('響度均衡啟用失敗（播放器已經佔用了音訊處理）'), 'warn');
      }
    };

    for (const type of ['play', 'playing']) onMainVideo(type, (event) => wire(event.target));
    const onUserAction = () => {
      userActed = true;
      try {
        if (audio && audio.state !== 'running') audio.resume();
      } catch {
      }
      const video = mainVideo();
      if (video && !video.paused) wire(video);
    };
    for (const type of ['pointerdown', 'keydown']) document.addEventListener(type, onUserAction, true);
  }

  function setupPlayback() {
    cleanCopiedLinks();
    if (!IS_TOP || !PAGE.www) return;

    store.on('x.wl.req', (request) => {
      if (request && PAGE.video && Date.now() - (request.t || 0) < 15000) addSelfToWatchLater();
    });

    applyDefaultsPerVideo(rememberRate());
    wheelVolume();
    afterPlaybackEnds();
    if (val('x.loud')) normalizeLoudness();

    onFullscreenChange(() => {
      if (turn.degrees % 180) setTimeout(applyTurn, 300);
    });
    window.addEventListener('resize', () => {
      if (turn.degrees % 180) applyTurn();
    });
  }

  const MP4 = (() => {
    const TEXT = new TextEncoder();
    const fourcc = (bytes, at) => String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);

    const u64 = (view, at) => view.getUint32(at) * 2 ** 32 + view.getUint32(at + 4);

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

    const path = (bytes, view, parent, ...types) =>
      types.reduce((box, type) => box && child(bytes, view, box, type), parent);

    const appleFriendly = (stsd) => {
      if (stsd.length < 24 || fourcc(stsd, 20) !== 'hev1') return stsd;
      const copy = stsd.slice();
      copy.set(TEXT.encode('hvc1'), 20);
      return copy;
    };

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

      const trex = path(bytes, view, moov, 'mvex', 'trex');
      const defaults = trex
        ? { duration: view.getUint32(trex.body + 12), size: view.getUint32(trex.body + 16), flags: view.getUint32(trex.body + 20) }
        : { duration: 0, size: 0, flags: 0 };

      let mediaTime = 0;
      const elst = path(bytes, view, trak, 'edts', 'elst');
      if (elst && view.getUint32(elst.body + 4) > 0) {
        const version = bytes[elst.body];
        mediaTime = version === 1 ? Number(view.getBigInt64(elst.body + 16)) : view.getInt32(elst.body + 12);
        if (mediaTime < 0) mediaTime = 0;
      }

      const samples = [];
      const runs = [];
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

    const trackHeader = (track, id, movieDuration) => {
      const version = track.tkhd[8];
      const tail = track.tkhd.subarray(version === 1 ? 8 + 36 : 8 + 24);
      return fullBox('tkhd', 0, 3, u32s(0, 0, id, 0, movieDuration), tail);
    };

    const build = (tracks) => {
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

          new Uint8Array([0x01, 0x00, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
          MATRIX,
          new Uint8Array(24),
          u32s(tracks.length + 1),
        );
        return box('moov', mvhd, ...traks);
      };

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

  const DOWNLOAD_BUILT = BUILD.download !== false;
  if (DOWNLOAD_BUILT) defOpt('x.dl', true, {
    tab: 'video',
    group: t('下載'),
    label: t('影片下載'),
    hint: t('影片頁工具列多一個「下載」，選清晰度後在瀏覽器裡下載並合成 MP4；能下載的清晰度和網頁上能看的一樣'),
  });
  if (DOWNLOAD_BUILT) defOpt('x.dl.codec', 'avc', {
    tab: 'video',
    group: t('下載'),
    type: 'select',
    label: t('優先的編碼'),
    hint: t('AVC 幾乎所有播放器都能開；HEVC、AV1 檔案小一些，但舊的裝置可能播不了。影片沒有這種編碼時自動換別的'),
    choices: [
      ['avc', 'AVC (H.264)'],
      ['hevc', 'HEVC (H.265)'],
      ['av1', 'AV1'],
    ],
  });

  const CODEC_IDS = { avc: 7, hevc: 12, av1: 13 };
  const CODEC_NAMES = { 7: 'AVC', 12: 'HEVC', 13: 'AV1' };

  const DL_CHUNK = 4 * 1024 * 1024;
  const DL_PARALLEL = 4;

  const currentVideo = async () => {
    const state = W.__INITIAL_STATE__ || {};
    const bvid = location.pathname.match(/\/video\/(BV[0-9A-Za-z]+)/)?.[1] || state.videoData?.bvid;
    if (!bvid) throw new Error(t('這個頁面找不到影片 BV 號'));
    const cid = await dm.cid();
    const pages = state.videoData?.bvid === bvid ? state.videoData.pages || [] : [];
    const part = Math.max(1, parseInt(new URLSearchParams(location.search).get('p') || '1', 10) || 1);
    const title = (state.videoData?.bvid === bvid && state.videoData.title) || document.querySelector('h1')?.textContent || bvid;
    const partTitle = pages.length > 1 ? pages[part - 1]?.part || '' : '';
    return { bvid, cid, title: String(title).trim(), part: pages.length > 1 ? part : 0, partTitle };
  };

  const fetchStreams = async (video) => {
    const query = `bvid=${encodeURIComponent(video.bvid)}&cid=${video.cid}&qn=127&fnval=4048&fnver=0&fourk=1`;
    const [play, nav] = await Promise.all([
      dm.getJSON(`https://api.bilibili.com/x/player/playurl?${query}`),
      dm.getJSON('https://api.bilibili.com/x/web-interface/nav').catch(() => null),
    ]);
    if (play?.code !== 0) throw new Error(play?.message || t`錯誤碼 ${play?.code}`);
    const data = play.data || {};
    if (!data.dash) throw new Error(t('這部影片沒有可下載的格式'));
    const names = new Map((data.support_formats || []).map((format) => [format.quality, format.new_description || format.display_desc]));
    const order = [CODEC_IDS[val('x.dl.codec')] || 7, 7, 12, 13];
    const byQuality = new Map();
    for (const stream of data.dash.video || []) {
      const list = byQuality.get(stream.id) || [];
      list.push(stream);
      byQuality.set(stream.id, list);
    }
    const qualities = [...byQuality.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([quality, list]) => {
        const stream = order.map((codec) => list.find((item) => item.codecid === codec)).find(Boolean) || list[0];
        return { quality, name: names.get(quality) || String(quality), stream, codec: CODEC_NAMES[stream.codecid] || stream.codecs };
      });

    const given = new Set(byQuality.keys());
    const locked = (data.accept_quality || [])
      .filter((quality) => !given.has(quality) && quality > (qualities[0]?.quality || 0))
      .map((quality) => names.get(quality) || String(quality));
    const audio = [...(data.dash.audio || [])].sort((a, b) => b.bandwidth - a.bandwidth)[0] || null;
    return {
      qualities,
      audio,
      locked,
      login: !!nav?.data?.isLogin,
      vip: !!nav?.data?.vipStatus,
      duration: Number(data.dash.duration) || Number(data.timelength) / 1000 || 0,
    };
  };

  const streamUrls = (stream) =>
    [stream.baseUrl || stream.base_url, ...(stream.backupUrl || stream.backup_url || [])]
      .filter(Boolean)
      .map(secureUrl)
      .sort((a, b) => /mcdn|szbdyd/.test(a) - /mcdn|szbdyd/.test(b));

  const downloadStream = async (urls, onBytes, signal) => {
    const pieces = [];
    let end = Infinity;
    let next = 0;
    let total = 0;
    const fetchPiece = async (index) => {
      const from = index * DL_CHUNK;
      for (let attempt = 0; attempt < urls.length * 2; attempt++) {
        if (signal.aborted) throw new DOMException('aborted', 'AbortError');
        const url = urls[attempt % urls.length];
        try {
          const response = await fetch(url, { headers: { Range: `bytes=${from}-${from + DL_CHUNK - 1}` }, signal });
          if (response.status === 416) return null;
          if (response.status !== 206 && response.status !== 200) throw new Error(`HTTP ${response.status}`);
          const bytes = new Uint8Array(await response.arrayBuffer());

          if (response.status === 200) return { whole: bytes };
          return bytes;
        } catch (error) {
          if (error?.name === 'AbortError') throw error;
          await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
        }
      }
      throw new Error(t('下載中斷，請稍後再試'));
    };
    const worker = async () => {
      while (next < end) {
        const index = next++;
        const bytes = await fetchPiece(index);
        if (bytes?.whole) {
          pieces.length = 0;
          pieces[0] = bytes.whole;
          end = 0;
          onBytes(bytes.whole.length - total);
          total = bytes.whole.length;
          return;
        }
        if (!bytes || bytes.length < DL_CHUNK) end = Math.min(end, index + 1);
        if (bytes?.length) {
          pieces[index] = bytes;
          total += bytes.length;
          onBytes(bytes.length);
        }
      }
    };
    await Promise.all(Array.from({ length: DL_PARALLEL }, worker));
    const used = pieces.filter(Boolean);
    const out = new Uint8Array(used.reduce((sum, piece) => sum + piece.length, 0));
    let at = 0;
    for (const piece of used) out.set(piece, at), (at += piece.length);
    return out.buffer;
  };

  const formatBytes = (bytes) =>
    bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(2)} GB` : `${Math.max(0.1, bytes / 1024 ** 2).toFixed(1)} MB`;

  const DL_ICON = '<path d="M8 2.5v7.5M4.8 7 8 10.2 11.2 7M3 13h10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>';

  function setupDownload() {
    if (!PAGE.video || !DOWNLOAD_BUILT) return;
    let popover = null;
    let job = null;

    const close = () => {
      if (job) return;
      popover?.remove();
      popover = null;
    };
    let anchor = null;

    const place = (button = anchor) => {
      if (!popover || !button) return;
      anchor = button;
      const rect = button.getBoundingClientRect();
      const width = popover.offsetWidth || 320;
      const height = popover.offsetHeight || 200;
      popover.style.left = `${Math.max(12, Math.min(innerWidth - width - 12, rect.right - width))}px`;
      const below = rect.bottom + 8;
      popover.style.top = `${below + height > innerHeight - 12 && rect.top - height - 8 > 12 ? rect.top - height - 8 : below}px`;
    };

    const row = (title, detail, onclick, disabled = false) =>
      h(
        'button',
        { class: 'bga-dl-row', type: 'button', disabled, onclick },
        h('span', { class: 'bga-dl-name' }, title),
        h('span', { class: 'bga-dl-detail' }, detail),
      );

    const start = async (video, info, choice) => {
      const audioOnly = choice === 'audio';
      const streams = audioOnly ? [info.audio] : [choice.stream, info.audio].filter(Boolean);
      const estimate = streams.reduce((sum, stream) => sum + ((stream.bandwidth || 0) * info.duration) / 8, 0);
      const controller = new AbortController();
      let received = 0;
      let phase = t('下載中');
      const bar = h('div', { class: 'bga-dl-bar' }, h('i'));
      const status = h('div', { class: 'bga-dl-status' });
      const render = () => {
        const ratio = estimate ? Math.min(0.99, received / estimate) : 0;
        bar.firstChild.style.width = `${(ratio * 100).toFixed(1)}%`;
        status.textContent = `${phase} · ${formatBytes(received)}${estimate ? ` / ≈${formatBytes(estimate)}` : ''}`;
      };
      job = { abort: () => controller.abort() };
      popover.replaceChildren(
        h('div', { class: 'bga-dl-head' }, audioOnly ? t('下載音訊') : t`下載 ${choice.name}`),
        bar,
        status,
        h('button', { class: 'bga-dl-cancel', type: 'button', onclick: () => controller.abort() }, t('取消')),
      );
      place();
      render();
      try {
        const buffers = await Promise.all(
          streams.map((stream) =>
            downloadStream(
              streamUrls(stream),
              (bytes) => {
                received += bytes;
                render();
              },
              controller.signal,
            ),
          ),
        );
        phase = t('合成中');
        render();

        await new Promise((resolve) => setTimeout(resolve, 30));
        const tracks = buffers.map((buffer) => MP4.readTrack(buffer));
        const blob = new Blob(MP4.build(tracks), { type: audioOnly ? 'audio/mp4' : 'video/mp4' });
        const name = [video.title, video.part ? `P${video.part} ${video.partTitle}` : '', `[${video.bvid}]`, audioOnly ? '' : choice.name]
          .filter(Boolean)
          .join(' ');
        saveBlob(blob, name, audioOnly ? 'm4a' : 'mp4');
        toast(t`已交給瀏覽器下載：${formatBytes(blob.size)}`, 'ok', 4000);
      } catch (error) {
        if (error?.name === 'AbortError') toast(t('已取消下載'), 'info');
        else {
          warn('下载失败', error);
          toast(t`下載失敗：${error?.message || error}`, 'warn', 5000);
        }
      } finally {
        job = null;
        close();
      }
    };

    const open = async (button) => {
      if (popover) return job ? null : close();
      popover = h('div', { class: 'bga-dl bga-ui', dataset: { accent: store.get('x.ui.accent', 'pink') } }, h('div', { class: 'bga-dl-head' }, t('讀取清晰度…')));
      document.body.appendChild(popover);
      place(button);
      try {
        const video = await currentVideo();
        const info = await fetchStreams(video);
        if (!popover) return;
        const size = (stream) => (info.duration ? `≈${formatBytes((((stream?.bandwidth || 0) + (info.audio?.bandwidth || 0)) * info.duration) / 8)}` : '');
        const notes = [];
        if (info.locked.length) {
          notes.push(info.login ? t`${info.locked.join('、')} 需要大會員` : t`登入後可下載更高畫質（${info.locked.join('、')}）`);
        }
        if (info.duration > 3600) notes.push(t('影片很長：檔案會很大，瀏覽器需要足夠的記憶體'));
        popover.replaceChildren(
          h('div', { class: 'bga-dl-head' }, t('下載')),
          ...info.qualities.map((choice) => row(choice.name, `${choice.codec} · ${size(choice.stream)}`, () => start(video, info, choice))),
          info.audio && row(t('只要音訊'), `M4A · ${info.duration ? `≈${formatBytes((info.audio.bandwidth * info.duration) / 8)}` : ''}`, () => start(video, info, 'audio')),
          ...notes.map((note) => h('div', { class: 'bga-dl-note' }, note)),
        );
        place(button);
      } catch (error) {
        popover?.replaceChildren(h('div', { class: 'bga-dl-note' }, t`讀取失敗：${error?.message || error}`));
      }
    };

    document.addEventListener(
      'pointerdown',
      (event) => {
        if (popover && !event.composedPath().some((node) => node === popover || node?.classList?.contains?.('bga-dl-btn'))) close();
      },
      true,
    );

    addEventListener('scroll', () => place(), { passive: true });
    addEventListener('resize', () => place());

    const started = Date.now();
    const hydrated = () => !!document.querySelector('bili-comments, #commentapp .bili-comment') || Date.now() - started > 15000;

    const sync = () => {
      if (document.hidden || !hydrated()) return;
      const bar = document.querySelector('.video-toolbar-right');
      const mine = document.querySelector('.bga-dl-btn');
      if (!val('x.dl')) return mine?.remove();
      if (!bar || (mine && mine.parentElement === bar)) return;
      mine?.remove();
      const button = h(
        'div',
        { class: 'video-toolbar-right-item bga-dl-btn', role: 'button', tabindex: '0', title: t('下載這部影片') },
        svgIcon(DL_ICON),
        h('span', {}, t('下載')),
      );
      button.addEventListener('click', () => open(button));
      button.addEventListener('keydown', (event) => event.key === 'Enter' && open(button));
      bar.prepend(button);
    };
    watch('x.dl', sync);
    setInterval(sync, 2000);
  }

  const clickControl = (selector, missing) => {
    const control = document.querySelector(selector);
    if (!control || getComputedStyle(control).display === 'none') return void toast(missing, 'warn', 2000);
    control.click();
  };

  defKey('panel', 'Alt+Shift+KeyW', {
    group: t('通用'),
    label: t('開關設定面板'),
    when: () => IS_TOP && !!panelToggle,
    run: () => panelToggle(),
  });

  const playerKey = (id, combo, meta) => defKey(id, combo, { group: t('播放頁'), when: hasPlayer, ...meta });
  const seekStep = () => Number(val('x.seek.step')) || 5;

  playerKey('pod', 'KeyL', {
    label: t('選集浮層'),
    hint: t('合集 / 分 P 清單，全螢幕下也可以用'),
    run: () => clickControl('.bpx-player-ctrl-eplist, .bga-pod-btn', t('這個影片沒有選集')),
  });
  playerKey('pip', 'KeyP', {
    label: t('畫中畫'),
    run: () => clickControl('.bpx-player-ctrl-pip', t('找不到畫中畫按鈕')),
  });
  playerKey('fit', 'KeyC', {
    label: t('裁切模式'),
    hint: t('畫面填滿播放器'),
    run: () => toast(toggleVideoFit() ? t('裁切模式：開') : t('裁切模式：關'), 'info', 1200),
  });
  playerKey('subtitle', 'KeyV', {
    label: t('字幕開關'),
    run: () =>
      clickControl(
        '.bpx-player-ctrl-subtitle .bpx-player-ctrl-btn-icon, .bpx-player-ctrl-subtitle',
        t('這個影片沒有字幕'),
      ),
  });
  playerKey('playPause', 'KeyS', { label: t('播放 / 暫停'), run: togglePlay });
  playerKey('seekBack', 'KeyA', {
    label: t('快退'),
    hint: t('秒數在「播放頁 → 播放」裡設定'),
    repeat: true,
    run: () => seekBy(-seekStep()),
  });
  playerKey('seekFwd', 'KeyD', { label: t('快進'), repeat: true, run: () => seekBy(seekStep()) });
  playerKey('frameBack', 'Comma', { label: t('上一幀'), hint: t('會先暫停'), repeat: true, run: () => stepFrame(-1) });
  playerKey('frameFwd', 'Period', { label: t('下一幀'), repeat: true, run: () => stepFrame(1) });
  playerKey('shot', 'Shift+KeyS', { label: t('截圖'), hint: t('以影片原始解析度存成 PNG'), run: screenshot });
  playerKey('dmToggle', 'Shift+KeyD', {
    label: t('彈幕開關'),
    run: () => clickControl('.bpx-player-dm-switch input.bui-danmaku-switch-input', t('找不到彈幕開關')),
  });
  playerKey('rotate', 'Shift+KeyR', { label: t('畫面旋轉 90°'), run: rotateVideo });
  playerKey('mirror', 'Shift+KeyM', { label: t('畫面鏡像'), run: mirrorVideo });
  playerKey('copyLink', 'Shift+KeyC', {
    label: t('複製乾淨連結'),
    hint: t('不帶任何追蹤參數的影片網址'),
    run: copyCleanLink,
  });
  playerKey('saveCover', '', { label: t('保存目前影片的封面'), run: saveCurrentCover });
  playerKey('toViewAll', '', {
    label: t('所有開著的影片分頁加入稍後再看'),
    when: () => IS_TOP,
    run: requestWatchLaterAll,
  });
  playerKey('rateUp', 'Shift+Period', { label: t('加速 0.25×'), repeat: true, run: () => stepRate(0.25) });
  playerKey('rateDown', 'Shift+Comma', { label: t('減速 0.25×'), repeat: true, run: () => stepRate(-0.25) });
  playerKey('rateReset', 'Shift+Slash', { label: t('回到 1× 倍速'), run: () => stepRate(0) });
  playerKey('dmSearch', '', {
    label: t('打開彈幕查詢'),
    when: () => IS_TOP && hasPlayer() && !!panelToggle,
    run: () => {
      if (!document.querySelector('#bga-panel:popover-open')) panelToggle();
      document.querySelector('#bga-panel .bga-tab[data-tab="danmaku"]')?.click();
      document.querySelector('#bga-panel .bga-page[data-active] input[type=search]')?.focus();
    },
  });

  const livePlayer = () => {
    try {
      return W.livePlayer || W.top.livePlayer;
    } catch {
      return W.livePlayer;
    }
  };
  const hasLivePlayer = () => PAGE.live && !!livePlayer()?.setFullscreenStatus;

  const LIVE_SCREEN = { normal: 0, web: 1, full: 2 };
  const liveScreen = () => {
    if (document.body.classList.contains('player-full-win')) return LIVE_SCREEN.web;
    if (fullscreenElement() || document.body.classList.contains('fullscreen-fix')) return LIVE_SCREEN.full;
    return LIVE_SCREEN.normal;
  };

  const toggleLiveScreen = (mode) => livePlayer().setFullscreenStatus(liveScreen() === mode ? LIVE_SCREEN.normal : mode);

  defKey('liveWeb', 'KeyW', {
    group: t('直播'),
    label: t('網頁全屏'),
    when: hasLivePlayer,
    run: () => toggleLiveScreen(LIVE_SCREEN.web),
  });
  defKey('liveFull', 'KeyF', {
    group: t('直播'),
    label: t('全螢幕'),
    when: hasLivePlayer,
    run: () => toggleLiveScreen(LIVE_SCREEN.full),
  });
  defKey('liveChat', 'KeyH', {
    group: t('直播'),
    label: t('收起 / 展開聊天'),
    hint: t('網頁全屏或全螢幕時才有作用'),
    when: hasLivePlayer,
    run: () => {
      if (liveScreen() === LIVE_SCREEN.normal) return void toast(t('先進入網頁全屏或全螢幕，才能收起聊天'), 'info', 2000);
      document.getElementById('aside-area-toggle-btn')?.click();
    },
  });

  function setupHotkeys() {
    const isTyping = (event) => {
      const target = event.composedPath?.()[0] || event.target;
      if (target?.nodeType !== Node.ELEMENT_NODE) return false;
      return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
    };
    const applies = (hotkey) => {
      try {
        return !hotkey.when || !!hotkey.when();
      } catch {
        return false;
      }
    };

    window.addEventListener(
      'keydown',
      (event) => {
        if (keyCapturing || event.isComposing) return;
        const combo = comboOf(event);
        if (!combo) return;
        if (isTyping(event) && !(event.altKey || event.ctrlKey || event.metaKey)) return;

        const panelOpen = !!document.querySelector('#bga-panel:popover-open');

        for (const hotkey of HOTKEYS) {
          if (keyOf(hotkey) !== combo) continue;
          if (panelOpen && hotkey.id !== 'panel') continue;
          if (!applies(hotkey)) continue;
          event.preventDefault();
          event.stopImmediatePropagation();

          if (!event.repeat || hotkey.repeat) safe(() => hotkey.run(), `快捷键 ${hotkey.id}`);
          return;
        }
      },
      true,
    );
  }

  const EXTRA_SETTING_KEYS = ['x.keys', '小窗右', '小窗下', '小窗宽度', 'x.rate.value', 'biliUsers'];
  const BACKUP_APP_ID = 'bilibili-great-again';

  const BACKUP_APP_IDS = [BACKUP_APP_ID, 'wider-bilibili'];

  const exportSettings = () => {
    const data = {};
    for (const key of [...Object.keys(OPTS), ...EXTRA_SETTING_KEYS]) {
      const value = store.get(key);
      if (value !== undefined) data[key] = value;
    }
    const json = JSON.stringify({ app: BACKUP_APP_ID, version: VERSION, data }, null, 2);
    saveBlob(
      new Blob([json], { type: 'application/json' }),
      `bilibili-settings-${new Date().toISOString().slice(0, 10)}`,
      'json',
    );
  };

  const importSettings = (text) => {
    const backup = JSON.parse(text);
    const valid = BACKUP_APP_IDS.includes(backup?.app) && backup.data && typeof backup.data === 'object';
    if (!valid) throw new Error(t('不是這個腳本匯出的設定檔'));
    const known = new Set([...Object.keys(OPTS), ...EXTRA_SETTING_KEYS]);
    let count = 0;
    for (const [key, value] of Object.entries(backup.data)) {
      if (!known.has(key)) continue;
      store.set(key, value);
      count += 1;
    }
    return count;
  };

  const pickTextFile = (accept) =>
    new Promise((resolve) => {
      const input = h('input', { type: 'file', accept, style: 'display:none' });
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        input.remove();
        resolve(file ? await file.text() : null);
      });
      input.addEventListener('cancel', () => {
        input.remove();
        resolve(null);
      });
      (panel || document.body).appendChild(input);
      input.click();
    });

  let resetArmedUntil = 0;
  const resetArmed = () => Date.now() < resetArmedUntil;

  ACTIONS.push({
    tab: 'general',
    group: t('設定面板'),
    label: t('還原全部預設值'),
    hint: () =>
      resetArmed() ? t('再按一次確認。備註不會被清除') : t('所有開關、數值、快捷鍵回到預設；屏蔽詞和備註保留'),
    button: () => (resetArmed() ? t('確認還原') : t('還原')),
    run() {
      if (!resetArmed()) {
        resetArmedUntil = Date.now() + 5000;
        return;
      }
      resetArmedUntil = 0;
      for (const option of Object.values(OPTS)) {
        if (!option.keep) store.del(option.key);
      }
      for (const key of ['小窗右', '小窗下', '小窗宽度', 'x.keys']) store.del(key);
      toast(t('已還原預設，重新整理後完全生效'), 'ok');
      markPanelDirty();
    },
  });

  ACTIONS.push({
    tab: 'general',
    group: t('設定面板'),
    label: t('匯出全部設定'),
    hint: t('所有開關、數值、快捷鍵、屏蔽詞和用戶備註存成一個 JSON 檔'),
    button: t('匯出'),
    run: exportSettings,
  });

  ACTIONS.push({
    tab: 'general',
    group: t('設定面板'),
    label: t('匯入設定'),
    hint: t('讀取「匯出全部設定」存的檔案，覆蓋檔案裡有的項目，其餘不動'),
    button: t('選擇檔案'),
    run() {
      pickTextFile('.json,application/json').then((text) => {
        if (text == null) return;
        try {
          toast(t`已匯入 ${importSettings(text)} 項設定，重新整理後完全生效`, 'ok');
          markPanelDirty();
        } catch (error) {
          toast(t`匯入失敗：${error.message || t('JSON 格式錯誤')}`, 'warn');
        }
      });
    },
  });

  const describeElement = (element) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return {
      el: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}.${String(element.className?.baseVal ?? element.className).slice(0, 60)}`,
      box: [box.x, box.y, box.width, box.height].map(Math.round).join(','),
      position: style.position,
      overflow: style.overflow,
      display: style.display,
      opacity: style.opacity,
      transform: style.transform,
      font: `${style.fontSize}/${style.lineHeight} ${style.fontFamily.slice(0, 40)}`,
      pointerEvents: style.pointerEvents,
      zIndex: style.zIndex,
    };
  };

  const collectDiagnostics = () => {
    const report = {
      version: VERSION,
      target: BUILD.target,
      agent: navigator.userAgent,
      page: location.host + location.pathname,
      viewport: [innerWidth, innerHeight, devicePixelRatio, Math.round(scrollY)].join(','),
      tokens: document.documentElement.getAttribute(TOKEN_ATTR),
      htmlClass: document.documentElement.className,
      visibility: document.visibilityState,
      styles: ownStyles.map((style) => `${style.dataset.bgaStyle}:${style.isConnected ? 1 : 0}`).join(' '),
      otherStyles: [...document.querySelectorAll('style:not([data-bga-style])')].length,
    };
    const search = document.querySelector('.nav-search-input');
    if (search) {
      const box = search.getBoundingClientRect();
      const chain = [];
      for (let element = search; element && chain.length < 7; element = element.parentElement) chain.push(describeElement(element));
      report.search = {
        placeholder: search.placeholder.length,
        value: search.value.length,
        chain,

        stackUpper: document.elementsFromPoint(box.x + 40, box.y + 5).slice(0, 8).map(describeElement),
        stackLower: document.elementsFromPoint(box.x + 40, box.y + box.height - 4).slice(0, 4).map((element) => describeElement(element).el),
        children: [...(search.parentElement?.children || [])].map(describeElement),
      };
    }
    const player = document.querySelector('#bilibili-player .bpx-player-container');
    if (player) {
      const box = player.getBoundingClientRect();
      report.player = {
        container: describeElement(player),
        screen: player.dataset.screen,
        stackCenter: document.elementsFromPoint(box.x + box.width / 2, box.y + box.height * 0.4).slice(0, 6).map((element) => describeElement(element).el),
      };
    }
    const hero = document.getElementById('bga-hero');
    if (hero) report.hero = { ...describeElement(hero), paused: hero.hasAttribute('data-paused'), slides: hero.querySelectorAll('.bga-hero-dots button').length };
    return JSON.stringify(report);
  };

  ACTIONS.push({
    tab: 'general',
    group: t('設定面板'),
    label: t('複製診斷資訊'),
    hint: t('版面出問題時按一下，把複製到的文字貼給開發者。只有版面資訊，不含帳號和你的設定內容'),
    button: t('複製'),
    run() {
      toast(copyNow(collectDiagnostics()) ? t('診斷資訊已複製') : t('複製失敗'), 'ok');
    },
  });

  defOpt('x.ui.theme', 'auto', {
    tab: 'general',
    group: t('設定面板'),
    type: 'select',
    label: t('外觀'),
    choices: [
      ['auto', t('跟隨系統')],
      ['light', t('淺色')],
      ['dark', t('深色')],
    ],
  });
  defOpt('x.lang', 'auto', {
    tab: 'general',
    group: t('設定面板'),
    type: 'select',
    label: t('語言'),
    hint: t('「自動」會跟隨瀏覽器的語言'),
    choices: [['auto', t('自動')], ...LANGUAGES],
    reload: true,
  });
  defOpt('x.ui.accent', 'pink', {
    tab: 'general',
    group: t('設定面板'),
    type: 'select',
    label: t('強調色'),
    choices: [
      ['pink', t('B站粉')],
      ['blue', t('B站藍')],
      ['graphite', t('石墨')],
    ],
  });

  TABS.push(['keys', t('快捷鍵')]);

  const TAB_ICONS = {
    general:
      '<circle cx="8" cy="8" r="2.2"/><path d="M8 1.6v1.6M8 12.8v1.6M1.6 8h1.6M12.8 8h1.6M3.5 3.5l1.1 1.1M11.4 11.4l1.1 1.1M3.5 12.5l1.1-1.1M11.4 4.6l1.1-1.1"/>',
    home: '<path d="M2.5 7.4L8 2.6l5.5 4.8V13a.6.6 0 01-.6.6H9.8V9.9H6.2v3.7H3.1a.6.6 0 01-.6-.6z"/>',
    video: '<rect x="1.6" y="3" width="12.8" height="9" rx="2"/><path d="M6.8 5.8v3.4l3-1.7z"/>',
    feed: '<rect x="2" y="2" width="5" height="5" rx="1.2"/><rect x="9" y="2" width="5" height="5" rx="1.2"/><rect x="2" y="9" width="5" height="5" rx="1.2"/><rect x="9" y="9" width="5" height="5" rx="1.2"/>',
    clean: '<path d="M8 1.6l5 2v4c0 3.2-2.1 5.6-5 6.8-2.9-1.2-5-3.6-5-6.8v-4z"/><path d="M5.8 8l1.6 1.6 2.9-3"/>',
    live: '<circle cx="8" cy="8" r="1.6"/><path d="M4.9 4.9a4.4 4.4 0 000 6.2M11.1 4.9a4.4 4.4 0 010 6.2M2.8 2.8a7.3 7.3 0 000 10.4M13.2 2.8a7.3 7.3 0 010 10.4"/>',
    comments:
      '<path d="M2 3.6a1.6 1.6 0 011.6-1.6h8.8A1.6 1.6 0 0114 3.6v6a1.6 1.6 0 01-1.6 1.6H7.2L4 14v-2.8h-.4A1.6 1.6 0 012 9.6z"/>',
    memo: '<path d="M10.6 2.2l3.2 3.2-7.6 7.6-3.6.4.4-3.6z"/><path d="M9 3.8l3.2 3.2"/>',
    danmaku: '<circle cx="7" cy="7" r="4.4"/><path d="M10.3 10.3L14 14"/>',
    keys: '<rect x="1.6" y="3.6" width="12.8" height="8.8" rx="2"/><path d="M4.4 6.6h.01M7 6.6h.01M9.6 6.6h.01M11.8 6.6h.01M4.4 9.4h7.2"/>',
  };

  let panel = null;

  let panelToggle = null;

  const markPanelDirty = () => panel?.setAttribute('data-dirty', '');

  const groupCard = (page, name) => {
    let group = page.querySelector(`.bga-group[data-name="${CSS.escape(name)}"]`);
    if (!group) {
      group = page.appendChild(
        h('section', { class: 'bga-group', dataset: { name } }, h('h3', {}, name), h('div', { class: 'bga-card' })),
      );
    }
    return group.lastElementChild;
  };

  const panelRow = ({ label, hint, tag, control, block = false }) =>
    h(
      'div',
      { class: `bga-row${block ? ' bga-col' : ''}` },
      h(
        'div',
        { class: 'bga-text' },
        h('div', { class: 'bga-label' }, label, tag || null),
        hint ? h('div', { class: 'bga-hint' }, hint) : null,
      ),
      control,
    );

  const switchControl = (option, commit) => {
    const input = h('input', { type: 'checkbox', class: 'bga-switch', role: 'switch', 'aria-label': option.label });
    input.checked = !!val(option.key);
    input.addEventListener('change', () => commit(input.checked));
    store.on(option.key, (value) => {
      input.checked = !!(value === undefined ? option.def : value);
    });
    return {
      el: input,
      reset() {
        input.checked = option.def;
        commit(option.def);
      },
    };
  };

  const numberControl = (option, commit) => {
    const input = h('input', { type: 'number', min: '0', inputmode: 'numeric', 'aria-label': option.label });
    input.value = String(val(option.key));
    const setValue = (number) => {
      const value = Math.max(0, Math.round(number));
      input.value = String(value);
      commit(value);
    };
    const step = option.step || (option.def >= 50 ? 8 : 2);
    const nudge = (direction) => setValue((Number(input.value) || 0) + direction * step);

    input.addEventListener('input', () => {
      if (input.value !== '' && Number.isFinite(Number(input.value)))
        commit(Math.max(0, Math.round(Number(input.value))));
    });
    input.addEventListener('blur', () => {
      if (input.value === '') setValue(option.def);
    });
    store.on(option.key, (value) => {
      if (document.activeElement !== input) input.value = String(value === undefined ? option.def : value);
    });
    const el = h(
      'span',
      { class: 'bga-num' },
      h('button', { type: 'button', 'aria-label': t('減少'), onclick: () => nudge(-1) }, '−'),
      input,
      option.unit ? h('i', {}, option.unit) : null,
      h('button', { type: 'button', 'aria-label': t('增加'), onclick: () => nudge(1) }, '+'),
    );
    return { el, reset: () => setValue(option.def) };
  };

  const SEGMENT_MAX = 4;
  const SEGMENT_MAX_CHARS = 16;
  const selectControl = (option, commit) => {
    const chars = option.choices.reduce((sum, [, text]) => sum + String(text).length, 0);
    if (option.choices.length > SEGMENT_MAX || chars > SEGMENT_MAX_CHARS) return dropdownControl(option, commit);
    const buttons = option.choices.map(([value, text]) => h('button', { type: 'button', dataset: { value } }, text));
    const paint = (current) => {
      for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.value === String(current)));
    };
    const choose = (value) => {
      commit(value);
      paint(value);
    };
    option.choices.forEach(([value], index) => buttons[index].addEventListener('click', () => choose(value)));
    paint(val(option.key));
    store.on(option.key, (value) => paint(value === undefined ? option.def : value));
    return {
      el: h('span', { class: 'bga-seg', role: 'group', 'aria-label': option.label }, buttons),
      reset: () => choose(option.def),
    };
  };

  const dropdownControl = (option, commit) => {
    const select = h(
      'select',
      { class: 'bga-select', 'aria-label': option.label },
      option.choices.map(([value, text]) => h('option', { value }, text)),
    );
    const paint = (current) => (select.value = String(current));
    select.addEventListener('change', () => commit(select.value));
    paint(val(option.key));
    store.on(option.key, (value) => paint(value === undefined ? option.def : value));
    return {
      el: select,
      reset: () => {
        commit(option.def);
        paint(option.def);
      },
    };
  };

  const textControl = (option, commit) => {
    const textarea = h('textarea', { spellcheck: 'false', 'aria-label': option.label });
    textarea.value = String(val(option.key) ?? '');
    if (option.placeholder) textarea.placeholder = option.placeholder;
    textarea.addEventListener('change', () => commit(textarea.value.trim() || option.def));
    store.on(option.key, (value) => {
      if (document.activeElement !== textarea) textarea.value = String(value === undefined ? option.def : value);
    });
    return {
      el: textarea,
      block: true,
      reset() {
        textarea.value = option.def;
        commit(option.def);
      },
    };
  };

  const OPTION_CONTROLS = { bool: switchControl, num: numberControl, select: selectControl, text: textControl };

  const optionRow = (option) => {
    const commit = (value) => {
      if (value === option.def) store.del(option.key);
      else store.set(option.key, value);
      if (option.reload) markPanelDirty();
    };
    const control = OPTION_CONTROLS[option.type](option, commit);
    const reloadTag = option.reload
      ? h('span', { class: 'bga-tag', title: t('重新整理頁面後生效'), 'aria-label': t('重新整理頁面後生效') }, '↻')
      : null;
    const row = panelRow({
      label: option.label,
      hint: option.hint,
      tag: reloadTag,
      control: control.el,
      block: control.block,
    });
    row.addEventListener('contextmenu', (event) => {
      if (event.target.closest('input[type=number], textarea')) return;
      event.preventDefault();
      control.reset();
      toast(t`「${option.label}」已還原預設`);
    });
    return row;
  };

  const actionRow = (action) => {
    const textOf = (value) => (typeof value === 'function' ? value() : value) || '';
    const hint = h('div', { class: 'bga-hint' });
    const button = h('button', { type: 'button', class: 'bga-btn' });
    const paint = () => {
      button.textContent = textOf(action.button) || t('執行');
      hint.textContent = textOf(action.hint);
      hint.hidden = !hint.textContent;
    };
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        await action.run();
      } finally {
        button.disabled = false;
        paint();
      }
    });
    paint();
    return h(
      'div',
      { class: 'bga-row' },
      h('div', { class: 'bga-text' }, h('div', { class: 'bga-label' }, action.label), hint),
      button,
    );
  };

  const aboutCard = () => {
    const link = (href, text) => h('a', { href, target: '_blank', rel: 'noopener' }, text);
    return h(
      'div',
      { class: 'bga-about' },
      h('div', {}, `${PRODUCT} ${VERSION} · `, link(BUILD.homepage, `@${BUILD.author}`)),
      h(
        'div',
        {},
        t('寬屏版面的構想來自 posthumz 的 '),
        link('https://github.com/posthumz/wider-bilibili', 'Wider Bilibili'),
        t('，在此致謝。'),
      ),
    );
  };

  function buildPanel() {
    if (panel) return panel;
    addStyle(STYLES.panel, 'panel');

    const pages = {};
    const tabButtons = [];
    const title = h('h2', {}, '');
    const body = h('div', { class: 'bga-body' });
    const tabTitle = (id) => TABS.find(([tabId]) => tabId === id)?.[1] || '';
    const selectedTab = () =>
      tabButtons.find((button) => button.getAttribute('aria-selected') === 'true')?.dataset.tab || TABS[0][0];

    const selectTab = (id) => {
      if (search.value) {
        search.value = '';
        applySearch();
      }
      for (const button of tabButtons) button.setAttribute('aria-selected', String(button.dataset.tab === id));
      for (const [pageId, page] of Object.entries(pages)) page.toggleAttribute('data-active', pageId === id);
      title.textContent = tabTitle(id);
      body.scrollTop = 0;
      try {
        sessionStorage.setItem('bga-tab', id);
      } catch {
      }
    };

    for (const [id, name] of TABS) {
      pages[id] = body.appendChild(h('div', { class: 'bga-page', role: 'tabpanel' }));
      const button = h('button', {
        type: 'button',
        class: 'bga-tab',
        role: 'tab',
        dataset: { tab: id },
        onclick: () => selectTab(id),
      });
      button.append(svgIcon(TAB_ICONS[id] || ''), name);
      tabButtons.push(button);
    }

    for (const option of Object.values(OPTS)) {
      if (pages[option.tab]) groupCard(pages[option.tab], option.group || '').appendChild(optionRow(option));
    }
    for (const action of ACTIONS) {
      if (pages[action.tab]) groupCard(pages[action.tab], action.group || '').appendChild(actionRow(action));
    }
    safe(() => renderMemoPage(pages.memo), '备注页');
    safe(() => renderDanmakuPage(pages.danmaku), '弹幕查询页');
    safe(() => renderKeysPage(pages.keys), '快捷键页');
    groupCard(pages.general, t('關於')).appendChild(aboutCard());

    const search = h('input', {
      class: 'bga-input bga-search',
      type: 'search',
      placeholder: t('搜尋設定'),
      'aria-label': t('搜尋設定'),
    });
    const noResults = body.appendChild(
      h('div', { class: 'bga-empty bga-search-empty', hidden: true }, t('沒有符合的設定')),
    );
    const applySearch = () => {
      const query = search.value.trim().toLowerCase();
      if (!query) {
        panel.removeAttribute('data-q');
        for (const el of body.querySelectorAll('[data-miss]')) el.removeAttribute('data-miss');
        title.textContent = tabTitle(selectedTab());
        return;
      }
      panel.setAttribute('data-q', '');
      title.textContent = t('搜尋結果');
      let hits = 0;
      for (const group of body.querySelectorAll('.bga-group')) {
        const groupMatches = group.dataset.name.toLowerCase().includes(query);
        let anyRow = false;
        for (const row of group.querySelectorAll('.bga-row')) {
          const text = row.querySelector('.bga-text')?.textContent.toLowerCase() || '';
          const matches = !!text && (groupMatches || text.includes(query));
          row.toggleAttribute('data-miss', !matches);
          if (matches) {
            anyRow = true;
            hits += 1;
          }
        }
        group.toggleAttribute('data-miss', !anyRow);
      }
      noResults.hidden = hits > 0;
      body.scrollTop = 0;
    };
    search.addEventListener('input', applySearch);

    const panelKey = h('kbd', {}, '');
    const paintPanelKey = () => {
      panelKey.textContent = comboText(keyOf(HOTKEYS.find((hotkey) => hotkey.id === 'panel'))) || t('未設定');
    };
    paintPanelKey();
    store.on('x.keys', paintPanelKey);

    const closeButton = h('button', {
      type: 'button',
      class: 'bga-close',
      'aria-label': t('關閉'),
      onclick: () => panel.hidePopover(),
    });
    closeButton.append(svgIcon('<path d="M2 2l8 8M10 2l-8 8"/>', 12));

    panel = h(
      'div',
      { id: 'bga-panel', class: 'bga-ui', popover: 'auto', role: 'dialog', 'aria-label': t`${PRODUCT} 設定` },
      h(
        'nav',
        { class: 'bga-side', role: 'tablist' },
        h(
          'div',
          { class: 'bga-brand' },
          h('b', {}, PRODUCT),
          h(
            'span',
            {},
            h('a', { href: BUILD.homepage, target: '_blank', rel: 'noopener' }, `@${BUILD.author}`),
            ` ${VERSION}`,
          ),
        ),
        search,
        tabButtons,
        h('div', { class: 'bga-side-foot' }, panelKey, t(' 開關面板'), h('br'), t('右鍵任一項還原預設')),
      ),
      h(
        'div',
        { class: 'bga-main' },
        h(
          'div',
          { class: 'bga-head' },
          title,
          h('button', { type: 'button', class: 'bga-reload', onclick: () => location.reload() }, t('重新整理以套用')),
          closeButton,
        ),
        body,
      ),
    );

    watch('x.ui.theme', (theme) => panel.setAttribute('data-theme', theme));
    watch('x.ui.accent', (accent) => {
      panel.setAttribute('data-accent', accent);
      document.querySelector('.bga-toasts')?.setAttribute('data-accent', accent);
    });
    document.body.appendChild(panel);

    let initialTab = TABS[0][0];
    try {
      initialTab = sessionStorage.getItem('bga-tab') || initialTab;
    } catch {
    }
    selectTab(pages[initialTab] ? initialTab : TABS[0][0]);
    return panel;
  }

  function setupPanel() {
    const host = () => {
      const fullscreen = fullscreenElement();
      return fullscreen && fullscreen.tagName !== 'VIDEO' ? fullscreen : document.body;
    };

    let shielded = false;
    const show = () => {
      const el = buildPanel();
      if (!shielded) {
        shielded = true;

        const SHIELDED_EVENTS = [
          'click',
          'dblclick',
          'mousedown',
          'mouseup',
          'pointerdown',
          'pointerup',
          'contextmenu',
          'wheel',
          'keydown',
          'keyup',
          'keypress',
        ];
        for (const type of SHIELDED_EVENTS) el.addEventListener(type, (event) => event.stopPropagation());
      }
      const target = host();
      if (el.parentElement !== target) target.appendChild(el);
      el.showPopover();
    };
    const toggle = () => {
      if (buildPanel().matches(':popover-open')) panel.hidePopover();
      else show();
    };

    for (const type of ['fullscreenchange', 'webkitfullscreenchange']) {
      document.addEventListener(type, () => {
        const target = host();
        if (!panel || panel.parentElement === target) return;
        const wasOpen = panel.matches(':popover-open');
        target.appendChild(panel);
        if (!wasOpen) return;
        try {
          panel.showPopover();
        } catch {
        }
      });
    }

    try {
      platform.addMenu(t('設定'), show);
    } catch {
    }
    panelToggle = toggle;

    W.__bga = { open: show, version: VERSION };
  }

  const normalizeMemoRecord = (record) => {
    const id = String(record?.id ?? record?.uid ?? record?.mid ?? '');
    const text = String(record?.memo ?? record?.remark ?? '').trim();
    if (!/^\d+$/.test(id) || !text) return null;
    return { id, nickname: record.nickname || record.name || '', avatar: record.avatar || record.face || '', memo: text };
  };

  const importMemos = (text) => {
    const parsed = JSON.parse(text);
    const records = [parsed, parsed?.biliUsers, parsed?.users].find(Array.isArray);
    if (!records) throw new Error(t('格式不對'));
    const merged = new Map(memo.list().map((user) => [String(user.id), user]));
    let count = 0;
    for (const record of records) {
      const user = normalizeMemoRecord(record);
      if (!user) continue;

      const existing = merged.get(user.id);
      merged.set(user.id, {
        ...user,
        nickname: user.nickname || existing?.nickname || '',
        avatar: user.avatar || existing?.avatar || '',
      });
      count += 1;
    }
    store.set('biliUsers', [...merged.values()]);
    return count;
  };

  function renderMemoPage(page) {
    const card = groupCard(page, t('備註清單'));
    const searchInput = h('input', { class: 'bga-input', type: 'search', placeholder: t('搜尋暱稱、備註或 UID') });
    const uidInput = h('input', {
      class: 'bga-input',
      type: 'text',
      inputmode: 'numeric',
      placeholder: 'UID',
      style: 'max-width:150px',
    });
    const memoInput = h('input', { class: 'bga-input', type: 'text', placeholder: t('備註') });
    const list = h('div', { class: 'bga-list' });

    const deleteButton = (user) => {
      const button = h('button', { type: 'button', class: 'bga-link' }, t('刪除'));
      button.addEventListener('click', () => {
        if (button.dataset.armed) return void memo.set(user.id, '');
        button.dataset.armed = '1';
        button.textContent = t('確認刪除');
        setTimeout(() => {
          if (!button.isConnected) return;
          delete button.dataset.armed;
          button.textContent = t('刪除');
        }, 3000);
      });
      return button;
    };

    const userRow = (user) => {
      const avatar = user.avatar
        ? h('img', {
            src: `${coverBase(user.avatar)}@64w_64h.webp`,
            alt: '',
            loading: 'lazy',
            referrerpolicy: 'no-referrer',
          })
        : h('span', { class: 'bga-ava' });
      const editor = h('input', { class: 'bga-input', type: 'text', value: user.memo || '', 'aria-label': t('備註') });
      editor.addEventListener('change', () => memo.set(user.id, editor.value.trim(), user.nickname, user.avatar));
      return h(
        'div',
        { class: 'bga-user' },
        avatar,
        h(
          'div',
          {},
          h(
            'a',
            { href: `https://space.bilibili.com/${user.id}`, target: '_blank', rel: 'noopener' },
            user.nickname || t('（未知暱稱）'),
          ),
          h('small', {}, user.id),
        ),
        editor,
        deleteButton(user),
      );
    };

    const render = () => {
      const query = searchInput.value.trim().toLowerCase();
      const users = memo
        .list()
        .filter((user) => !query || `${user.nickname} ${user.memo} ${user.id}`.toLowerCase().includes(query));
      if (users.length) return void list.replaceChildren(...users.map(userRow));
      const message = query
        ? t('沒有符合的備註')
        : t('還沒有備註。在評論區把滑鼠移到用戶名那一行點「備註」，或在空間頁點「＋ 備註」。');
      list.replaceChildren(h('div', { class: 'bga-empty' }, message));
    };

    const addByUid = async () => {
      const uid = uidInput.value.trim();
      const text = memoInput.value.trim();
      if (!/^\d+$/.test(uid)) return void toast(t('UID 只能是數字'), 'warn');
      if (!text) return void toast(t('請輸入備註'), 'warn');
      let profile = null;
      try {
        profile = (await dm.getJSON(`https://api.bilibili.com/x/web-interface/card?mid=${uid}`))?.data?.card;
      } catch {
      }
      memo.set(uid, text, profile?.name || '', profile?.face || '');
      uidInput.value = '';
      memoInput.value = '';
    };

    const exportMemos = () => {
      const json = JSON.stringify(memo.list(), null, 2);
      saveBlob(
        new Blob([json], { type: 'application/json' }),
        `bilibili-memo-${new Date().toISOString().slice(0, 10)}`,
        'json',
      );
    };
    const importFromFile = () => {
      pickTextFile('.json,application/json').then((text) => {
        if (text == null) return;
        try {
          toast(t`已匯入 ${importMemos(text)} 筆備註`, 'ok');
        } catch (error) {
          toast(t`匯入失敗：${error.message || t('JSON 格式錯誤')}`, 'warn');
        }
      });
    };

    searchInput.addEventListener('input', render);
    memoInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') addByUid();
    });
    store.on('biliUsers', () => {
      memo.refresh();
      render();
    });

    card.append(
      h(
        'div',
        { class: 'bga-row' },
        h(
          'div',
          { class: 'bga-bar', style: 'flex:1' },
          searchInput,
          h('button', { type: 'button', class: 'bga-btn', onclick: importFromFile }, t('匯入 JSON')),
          h('button', { type: 'button', class: 'bga-btn', onclick: exportMemos }, t('匯出')),
        ),
      ),
      h('div', { class: 'bga-row bga-col', style: 'padding:0' }, list),
      h(
        'div',
        { class: 'bga-row' },
        h(
          'div',
          { class: 'bga-bar', style: 'flex:1' },
          uidInput,
          memoInput,
          h('button', { type: 'button', class: 'bga-btn bga-primary', onclick: addByUid }, t('新增')),
        ),
      ),
    );
    render();
  }

  function renderDanmakuPage(page) {
    const card = groupCard(page, t('查詢'));
    if (!(PAGE.www && document.getElementById('bilibili-player'))) {
      card.appendChild(h('div', { class: 'bga-empty' }, t('請在影片 / 番劇播放頁打開這一頁。')));
      return;
    }

    const MAX_ROWS = 500;
    const keywordInput = h('input', { class: 'bga-input', type: 'search', placeholder: t('關鍵字（留空列出全部彈幕）') });
    const searchButton = h('button', { type: 'button', class: 'bga-btn bga-primary' }, t('搜尋'));
    const resolveAllButton = h('button', { type: 'button', class: 'bga-btn', hidden: true }, t('反查全部發送者'));
    const status = h('div', { class: 'bga-hint', style: 'padding:0 14px 8px' }, '');
    const results = h('div', { class: 'bga-list', style: 'max-height:340px' });

    let signal = { cancelled: false };

    const resolveSender = async (cell, hash) => {
      cell.textContent = t('反查中…');
      const uid = await dm.crack(hash, 1e8, signal);
      if (!cell.isConnected) return;
      if (!uid) {
        cell.textContent = t('查不到');
        cell.title = t('UID 超過 11 位（2022 年後註冊的 16 位 UID）無法由彈幕反查');
        return;
      }
      const note = memo.get(uid);
      cell.replaceChildren(
        h(
          'a',
          { href: `https://space.bilibili.com/${uid}`, target: '_blank', rel: 'noopener' },
          note ? `${uid}（${note}）` : uid,
        ),
      );
    };

    const localDate = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return new Date(timestamp - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    };
    const jumpTo = (second) => {
      const video = mainVideo();
      if (video) video.currentTime = second;
    };

    const resultTable = (rows) => {
      const senderCells = [];
      const tbody = h('tbody');
      for (const row of rows) {
        const sender = h('td', {});
        sender.appendChild(
          h('button', { type: 'button', class: 'bga-link', onclick: () => resolveSender(sender, row.hash) }, t('反查')),
        );
        senderCells.push([sender, row.hash]);
        tbody.appendChild(
          h(
            'tr',
            {},
            h(
              'td',
              {},
              h(
                'button',
                { type: 'button', class: 'bga-link', title: t('跳到這個時間'), onclick: () => jumpTo(row.second) },
                dm.fmt(row.second),
              ),
            ),
            h('td', { class: 'bga-dm-text' }, row.text),
            h('td', {}, localDate(row.ts)),
            sender,
          ),
        );
      }
      const head = h(
        'thead',
        {},
        h('tr', {}, ...[t('時間'), t('彈幕'), t('日期'), t('發送者')].map((title) => h('th', {}, title))),
      );
      return { table: h('table', {}, head, tbody), senderCells };
    };

    const resolveAll = async (senderCells) => {
      const mySignal = signal;
      resolveAllButton.disabled = true;
      let done = 0;
      for (const [cell, hash] of senderCells) {
        if (mySignal.cancelled) break;
        done += 1;
        resolveAllButton.textContent = t`反查中 ${done}/${senderCells.length}`;
        if (!cell.querySelector('a')) await resolveSender(cell, hash);
      }
      resolveAllButton.disabled = false;
      resolveAllButton.textContent = t('反查全部發送者');
    };

    const search = async () => {
      signal.cancelled = true;
      signal = { cancelled: false };
      searchButton.disabled = true;
      resolveAllButton.hidden = true;
      status.textContent = t('載入彈幕中…');
      results.replaceChildren();
      try {
        const rows = await dm.search(keywordInput.value.trim());
        const shown = rows.slice(0, MAX_ROWS);
        const truncated = rows.length > shown.length ? t`，只顯示前 ${shown.length} 條（加關鍵字縮小範圍）` : '';
        status.textContent = t`共 ${rows.length} 條${truncated}。點時間跳轉，點「反查」取得發送者（結果是 CRC32 對應的最小 UID；16 位新 UID 查不到或可能對應到別人）。`;
        if (!rows.length) {
          results.replaceChildren(h('div', { class: 'bga-empty' }, t('沒有符合的彈幕')));
          return;
        }
        const { table, senderCells } = resultTable(shown);
        results.replaceChildren(table);
        resolveAllButton.hidden = false;
        resolveAllButton.onclick = () => resolveAll(senderCells);
      } catch (error) {
        status.textContent = t`查詢失敗：${error.message || error}`;
      } finally {
        searchButton.disabled = false;
      }
    };

    searchButton.addEventListener('click', search);
    keywordInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') search();
    });
    card.append(
      h(
        'div',
        { class: 'bga-row' },
        h('div', { class: 'bga-bar', style: 'flex:1' }, keywordInput, searchButton, resolveAllButton),
      ),
      status,
      h('div', { class: 'bga-row bga-col', style: 'padding:0' }, results),
    );
  }

  const saveHotkey = (hotkey, combo) => {
    const custom = { ...keyMap() };
    if (combo === hotkey.def) delete custom[hotkey.id];
    else custom[hotkey.id] = combo;
    if (Object.keys(custom).length) store.set('x.keys', custom);
    else store.del('x.keys');
  };

  function renderKeysPage(page) {
    const repaints = [];

    const keyButton = (hotkey) => {
      const button = h('button', { type: 'button', class: 'bga-btn bga-key' }, '');
      const paint = () => {
        const combo = keyOf(hotkey);
        button.textContent = comboText(combo) || t('未設定');
        button.toggleAttribute('data-off', !combo);
      };
      repaints.push(paint);
      paint();

      button.addEventListener('click', () => {
        if (keyCapturing) return;
        keyCapturing = true;
        button.textContent = t('按下按鍵…');
        button.setAttribute('data-rec', '');

        const finish = () => {
          keyCapturing = false;
          button.removeAttribute('data-rec');
          window.removeEventListener('keydown', onKey, true);
          document.removeEventListener('pointerdown', onPointerDown, true);
          panel.removeEventListener('toggle', finish);
          paint();
        };
        const onKey = (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          if (event.code === 'Escape') return finish();
          const noModifier = !(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
          if (noModifier && (event.code === 'Backspace' || event.code === 'Delete')) {
            saveHotkey(hotkey, '');
            return finish();
          }
          const combo = comboOf(event);
          if (!combo) return;
          const taken = HOTKEYS.find((other) => other !== hotkey && keyOf(other) === combo);
          if (taken) toast(t`${comboText(combo)} 已經給「${taken.label}」用了`, 'warn');
          else saveHotkey(hotkey, combo);
          finish();
        };

        const onPointerDown = (event) => {
          if (event.target !== button) finish();
        };
        window.addEventListener('keydown', onKey, true);
        document.addEventListener('pointerdown', onPointerDown, true);
        panel.addEventListener('toggle', finish);
      });
      return button;
    };

    for (const hotkey of HOTKEYS) {
      const row = panelRow({ label: hotkey.label, hint: hotkey.hint, control: keyButton(hotkey) });
      row.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        saveHotkey(hotkey, hotkey.def);
        toast(t`「${hotkey.label}」已還原預設`);
      });
      groupCard(page, hotkey.group).appendChild(row);
    }
    store.on('x.keys', () => repaints.forEach((paint) => paint()));

    page.appendChild(
      h(
        'div',
        { class: 'bga-hint', style: 'margin:14px 12px 0' },
        t(
          '點按鈕後按下新的按鍵組合。Esc 取消，Delete 停用，右鍵還原預設。打字時單鍵快捷鍵不會觸發；和 B站原有按鍵相同時，以這裡的為準。',
        ),
      ),
    );
  }

  function boot() {
    const BOOT_STYLES = ['base', 'stage', 'nav', 'pod', 'pages', 'typography', 'clean', 'player', 'live', 'cards', 'home', 'download', 'ui'];
    for (const name of BOOT_STYLES) addStyle(STYLES[name], name);
    guardStyles();

    safe(setupNetwork, '网络');
    safe(setupTypography, '字体');
    safe(setupLiveTextGuard, '全屏点击');
    if (IS_TOP) safe(setupSearchRelayout, '搜索框重排');
    if (IS_TOP) safe(setupWide, '宽屏');
    if (IS_TOP) safe(setupNavCard, '卡片式导航栏');
    safe(setupClean, '净化');
    safe(setupComments, '评论区');
    safe(setupMemo, '备注');
    safe(setupCommentFilter, '评论过滤');
    safe(setupLive, '直播');
    safe(setupTitles, '标题屏蔽词');
    safe(setupDynFilter, '动态过滤');
    safe(setupPlayback, '播放器');
    bodyReady().then(() => safe(setupFeed, '首页过滤'));
    bodyReady().then(() => safe(setupHome, '首页主题'));
    bodyReady().then(() => safe(setupCards, '影片卡片'));
    safe(setupHotkeys, '快捷键');
    if (IS_TOP) bodyReady().then(() => safe(setupDownload, '下载'));
    if (IS_TOP) bodyReady().then(() => safe(setupPanel, '设置面板'));
    log(`${VERSION} 已加载`, IS_TOP ? '' : '(iframe)');

    platform.ready.then(() => {
      if (!IS_TOP || !platform.staleKeys?.some((key) => OPTS[key]?.reload)) return;
      bodyReady().then(() => toast(t('設定已同步，重新整理後完全生效'), 'info', 5000));
    });
  }

  if (W.__bgaRunning) {
    warn(`${W.__bgaRunning} 已经在这个页面运行，这一份（${BUILD.target}）不再启动`);
  } else {
    W.__bgaRunning = BUILD.target;
    boot();
  }
})();
