const n=`---
title: "[더미 게시글] CSS Grid 마스터하기"
date: "2024-06-26"
excerpt: "CSS Grid의 강력한 기능들을 활용해서 복잡한 레이아웃도 쉽게 구현하는 방법을 배워보세요."
tags: ["CSS", "Grid", "Layout", "Design"]
---

# CSS Grid 마스터하기

CSS Grid는 2차원 레이아웃을 위한 가장 강력한 도구입니다. Flexbox와 함께 현대적인 웹 레이아웃의 핵심이죠.

## 기본 개념

### Grid Container와 Grid Items

\`\`\`css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: 100px auto 50px;
  gap: 20px;
}
\`\`\`

### 반응형 그리드

\`\`\`css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
\`\`\`

## 실제 레이아웃 예제

### 1. 성배 레이아웃 (Holy Grail Layout)

\`\`\`css
.holy-grail {
  display: grid;
  min-height: 100vh;
  grid-template:
    "header header header" auto
    "nav main aside" 1fr
    "footer footer footer" auto
    / 200px 1fr 200px;
}

.header { grid-area: header; }
.nav { grid-area: nav; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
\`\`\`

### 2. 카드 레이아웃

\`\`\`css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
\`\`\`

## 고급 기능

### Grid Areas와 Named Lines

\`\`\`css
.advanced-grid {
  display: grid;
  grid-template-areas:
    "sidebar content content"
    "sidebar content content"
    "footer footer footer";
  grid-template-columns: [sidebar-start] 250px [sidebar-end content-start] 1fr 1fr [content-end];
  grid-template-rows: [content-start] 1fr 1fr [content-end] 100px;
}
\`\`\`

### 중첩 그리드

\`\`\`css
.nested-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
}

.nested-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
\`\`\`

## 실무 팁

### 1. 디버깅

Firefox 개발자 도구의 Grid Inspector를 활용하세요!

### 2. 브라우저 지원

\`\`\`css
/* 폴백 제공 */
.grid-container {
  display: flex; /* 폴백 */
  flex-wrap: wrap;
}

@supports (display: grid) {
  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}
\`\`\`

### 3. 성능 고려사항

- \`auto-fit\`과 \`auto-fill\`의 차이점 이해하기
- \`minmax()\` 함수 적극 활용
- 불필요한 중첩 그리드 피하기

## 마무리

CSS Grid를 마스터하면 어떤 복잡한 레이아웃도 쉽게 구현할 수 있습니다. 연습이 핵심이니 다양한 레이아웃을 직접 만들어보세요! `;export{n as default};
