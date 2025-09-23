const n=`---
title: "[더미 게시글] JavaScript 비동기 프로그래밍 패턴"
date: "2024-06-27"
excerpt: "Promise, async/await, 그리고 최신 비동기 패턴들을 마스터해서 더 나은 JavaScript 코드를 작성해보세요."
tags: ["JavaScript", "Async", "Promise", "ES2017"]
---

# JavaScript 비동기 프로그래밍 패턴

비동기 프로그래밍은 모던 JavaScript의 핵심입니다. 콜백 지옥에서 벗어나 깔끔한 코드를 작성하는 방법을 알아보겠습니다.

## Promise 기초

### Promise 생성과 사용

\`\`\`javascript
// Promise 생성
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.5
      if (success) {
        resolve({ data: '성공적으로 데이터를 가져왔습니다!' })
      } else {
        reject(new Error('데이터를 가져오는데 실패했습니다.'))
      }
    }, 1000)
  })
}

// Promise 사용
fetchData()
  .then(result => console.log(result))
  .catch(error => console.error(error))
\`\`\`

### Promise Chaining

\`\`\`javascript
fetch('/api/user')
  .then(response => response.json())
  .then(user => fetch(\`/api/user/\${user.id}/posts\`))
  .then(response => response.json())
  .then(posts => {
    console.log('사용자 포스트:', posts)
  })
  .catch(error => {
    console.error('에러 발생:', error)
  })
\`\`\`

## Async/Await 패턴

### 기본 사용법

\`\`\`javascript
async function getUserPosts(userId) {
  try {
    const userResponse = await fetch(\`/api/user/\${userId}\`)
    const user = await userResponse.json()
    
    const postsResponse = await fetch(\`/api/user/\${user.id}/posts\`)
    const posts = await postsResponse.json()
    
    return posts
  } catch (error) {
    console.error('에러 발생:', error)
    throw error
  }
}
\`\`\`

### 병렬 처리

\`\`\`javascript
// 순차 처리 (느림)
async function sequential() {
  const user1 = await fetchUser(1)
  const user2 = await fetchUser(2)
  const user3 = await fetchUser(3)
  
  return [user1, user2, user3]
}

// 병렬 처리 (빠름)
async function parallel() {
  const [user1, user2, user3] = await Promise.all([
    fetchUser(1),
    fetchUser(2),
    fetchUser(3)
  ])
  
  return [user1, user2, user3]
}
\`\`\`

## 고급 패턴

### Promise.allSettled

모든 Promise가 완료될 때까지 기다리되, 실패한 것도 포함합니다.

\`\`\`javascript
async function fetchAllData() {
  const promises = [
    fetch('/api/users'),
    fetch('/api/posts'),
    fetch('/api/comments')
  ]
  
  const results = await Promise.allSettled(promises)
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(\`API \${index + 1} 성공:\`, result.value)
    } else {
      console.log(\`API \${index + 1} 실패:\`, result.reason)
    }
  })
}
\`\`\`

### 재시도 로직

\`\`\`javascript
async function retryFetch(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return await response.json()
      }
      throw new Error(\`HTTP \${response.status}\`)
    } catch (error) {
      console.log(\`시도 \${i + 1} 실패:\`, error.message)
      
      if (i === maxRetries - 1) {
        throw error
      }
      
      // 지수 백오프
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      )
    }
  }
}
\`\`\`

### 타임아웃 처리

\`\`\`javascript
function withTimeout(promise, timeoutMs) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(\`타임아웃: \${timeoutMs}ms\`))
    }, timeoutMs)
  })
  
  return Promise.race([promise, timeout])
}

// 사용 예시
try {
  const data = await withTimeout(
    fetch('/api/slow-endpoint'),
    5000 // 5초 타임아웃
  )
  console.log(data)
} catch (error) {
  console.error('타임아웃 또는 에러:', error.message)
}
\`\`\`

## 실무 활용 팁

### 1. 에러 처리 패턴

\`\`\`javascript
class ApiService {
  async request(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`)
      }
      
      return await response.json()
    } catch (error) {
      // 로깅
      console.error('API 요청 실패:', { url, error: error.message })
      
      // 에러 재가공
      if (error.name === 'TypeError') {
        throw new Error('네트워크 연결을 확인해주세요.')
      }
      
      throw error
    }
  }
}
\`\`\`

### 2. 로딩 상태 관리

\`\`\`javascript
class DataManager {
  constructor() {
    this.loading = false
    this.data = null
    this.error = null
  }
  
  async fetchData(url) {
    this.loading = true
    this.error = null
    
    try {
      this.data = await fetch(url).then(r => r.json())
    } catch (error) {
      this.error = error.message
    } finally {
      this.loading = false
    }
  }
}
\`\`\`

## 마무리

비동기 프로그래밍은 현대 웹 개발의 필수 스킬입니다. Promise와 async/await를 잘 활용하면 더 읽기 쉽고 유지보수하기 좋은 코드를 작성할 수 있습니다! `;export{n as default};
