const n=`---
title: "[더미 게시글] Vue 3 시작하기"
date: "2024-06-24"
excerpt: "Vue 3의 새로운 기능들과 시작 방법에 대해 알아보겠습니다."
tags: ["Vue", "JavaScript", "Frontend"]
---

# Vue 3 시작하기

Vue 3는 많은 새로운 기능과 개선사항을 제공합니다. 이 포스트에서는 Vue 3의 주요 특징들을 살펴보겠습니다.

## 주요 새 기능들

### 1. Composition API

\`\`\`javascript
import { ref, computed } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)
    
    function increment() {
      count.value++
    }
    
    return {
      count,
      doubleCount,
      increment
    }
  }
}
\`\`\`

### 2. Multiple Root Nodes

Vue 3에서는 컴포넌트가 여러 루트 노드를 가질 수 있습니다:

\`\`\`vue
<template>
  <header>헤더</header>
  <main>메인 콘텐츠</main>
  <footer>푸터</footer>
</template>
\`\`\`

### 3. 향상된 TypeScript 지원

Vue 3는 TypeScript와의 호환성이 크게 개선되었습니다.

## 시작하기

Vue 3 프로젝트를 시작하는 가장 쉬운 방법:

\`\`\`bash
npm create vue@latest my-project
cd my-project
npm install
npm run dev
\`\`\`

## 마무리

Vue 3는 성능, 개발 경험, TypeScript 지원 모든 면에서 크게 개선되었습니다. 새 프로젝트를 시작한다면 Vue 3를 선택하는 것을 강력히 추천합니다! `;export{n as default};
