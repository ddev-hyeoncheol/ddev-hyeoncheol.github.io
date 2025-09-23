const n=`---
title: "[더미 게시글] 웹 성능 최적화 완벽 가이드"
date: "2024-06-28"
excerpt: "웹사이트 속도를 극대화하는 실전 최적화 기법들과 성능 측정 도구 활용법을 알아보세요."
tags: ["Performance", "Optimization", "Web", "Speed"]
---

# 웹 성능 최적화 완벽 가이드

웹 성능은 사용자 경험과 직결되는 중요한 요소입니다. 로딩 시간 1초 단축이 전환율을 얼마나 높일 수 있는지 알아보겠습니다.

## 성능 측정 도구

### 1. Chrome DevTools

\`\`\`javascript
// Performance API 활용
const startTime = performance.now()

// 작업 수행
await heavyTask()

const endTime = performance.now()
console.log(\`실행 시간: \${endTime - startTime}ms\`)

// 리소스 타이밍
performance.getEntriesByType('resource').forEach(resource => {
  console.log(\`\${resource.name}: \${resource.duration}ms\`)
})
\`\`\`

### 2. Core Web Vitals 모니터링

\`\`\`javascript
// LCP (Largest Contentful Paint) 측정
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    console.log('LCP:', entry.startTime)
  }
}).observe({ entryTypes: ['largest-contentful-paint'] })

// FID (First Input Delay) 측정
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    console.log('FID:', entry.processingStart - entry.startTime)
  }
}).observe({ entryTypes: ['first-input'] })
\`\`\`

## 리소스 최적화

### 이미지 최적화

\`\`\`html
<!-- 반응형 이미지 -->
<picture>
  <source 
    media="(min-width: 800px)" 
    srcset="hero-large.webp 1x, hero-large@2x.webp 2x"
    type="image/webp">
  <source 
    media="(min-width: 400px)" 
    srcset="hero-medium.webp 1x, hero-medium@2x.webp 2x"
    type="image/webp">
  <img 
    src="hero-small.jpg" 
    alt="Hero image"
    loading="lazy"
    decoding="async">
</picture>
\`\`\`

### CSS 최적화

\`\`\`css
/* Critical CSS 인라인 처리 */
<style>
  /* 위쪽 콘텐츠에 필요한 핵심 스타일만 */
  .header { 
    background: #fff; 
    height: 60px; 
  }
  .hero { 
    min-height: 400px; 
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); 
  }
</style>

/* 나머지 CSS는 비동기 로드 */
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
\`\`\`

### JavaScript 최적화

\`\`\`javascript
// 코드 분할과 동적 import
const LazyComponent = React.lazy(() => 
  import('./components/HeavyComponent')
)

// 트리 쉐이킹을 위한 모듈 import
import { debounce, throttle } from 'lodash-es'

// Web Workers 활용
const worker = new Worker('/worker.js')
worker.postMessage({ data: heavyData })
worker.onmessage = (event) => {
  console.log('처리 완료:', event.data)
}
\`\`\`

## 네트워크 최적화

### 리소스 힌트

\`\`\`html
<!-- DNS 사전 조회 -->
<link rel="dns-prefetch" href="//fonts.googleapis.com">

<!-- 사전 연결 -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- 리소스 사전 로드 -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

<!-- 다음 페이지 사전 가져오기 -->
<link rel="prefetch" href="/about">
\`\`\`

### HTTP/2 최적화

\`\`\`javascript
// 리소스 번들링 vs 개별 파일
// HTTP/2에서는 작은 파일들을 개별적으로 전송하는 것이 유리할 수 있음

// 서버 푸시 예시 (Node.js + HTTP/2)
const http2 = require('http2')

const server = http2.createSecureServer(options)
server.on('stream', (stream, headers) => {
  if (headers[':path'] === '/') {
    // CSS 파일 푸시
    stream.pushStream({
      ':path': '/styles.css'
    }, (err, pushStream) => {
      if (!err) {
        pushStream.respondWithFile('public/styles.css')
      }
    })
  }
})
\`\`\`

## 캐싱 전략

### Service Worker 캐싱

\`\`\`javascript
// sw.js
const CACHE_NAME = 'v1'
const urlsToCache = [
  '/',
  '/styles.css',
  '/app.js'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시된 버전이 있으면 반환, 없으면 네트워크 요청
        return response || fetch(event.request)
      })
  )
})
\`\`\`

### 브라우저 캐싱

\`\`\`javascript
// HTTP 헤더 설정 (Express.js 예시)
app.use('/static', express.static('public', {
  maxAge: '1y', // 1년 캐시
  etag: true,
  lastModified: true
}))

// 동적 콘텐츠 캐시 제어
app.get('/api/data', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300') // 5분 캐시
  res.json(data)
})
\`\`\`

## 렌더링 최적화

### 가상화 (Virtualization)

\`\`\`javascript
// React Window를 사용한 가상 스크롤
import { FixedSizeList as List } from 'react-window'

const VirtualizedList = ({ items }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index]}
    </div>
  )

  return (
    <List
      height={400}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  )
}
\`\`\`

### 레이아웃 최적화

\`\`\`css
/* GPU 가속 활용 */
.animated-element {
  transform: translateZ(0); /* 레이어 생성 */
  will-change: transform; /* 브라우저에게 변화 예고 */
}

/* 리플로우 최소화 */
.efficient-animation {
  /* position, width, height 대신 transform 사용 */
  transform: scale(1.1) translateX(10px);
  
  /* opacity와 transform만 애니메이션 */
  transition: transform 0.3s ease, opacity 0.3s ease;
}
\`\`\`

## 번들 최적화

### Webpack 설정

\`\`\`javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  
  // 트리 쉐이킹 활성화
  mode: 'production',
  
  // 압축 최적화
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8
    })
  ]
}
\`\`\`

## 실전 체크리스트

### 1. 이미지 최적화
- [ ] WebP 형식 사용
- [ ] 적절한 크기로 리사이징
- [ ] Lazy loading 적용
- [ ] Progressive JPEG 사용

### 2. CSS 최적화
- [ ] Critical CSS 인라인 처리
- [ ] 미사용 CSS 제거
- [ ] CSS 압축
- [ ] 폰트 로딩 최적화

### 3. JavaScript 최적화
- [ ] 코드 분할 적용
- [ ] 트리 쉐이킹 활성화
- [ ] 폴리필 최소화
- [ ] 번들 크기 분석

### 4. 네트워크 최적화
- [ ] CDN 사용
- [ ] HTTP/2 활용
- [ ] 압축 (Gzip/Brotli) 설정
- [ ] 리소스 힌트 추가

## 마무리

웹 성능 최적화는 지속적인 과정입니다. 정기적인 모니터링과 측정을 통해 사용자에게 최고의 경험을 제공하세요! `;export{n as default};
