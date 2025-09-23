const n=`---
title: "[더미 게시글] React Hooks 완벽 가이드"
date: "2024-06-25"
excerpt: "React Hooks의 기본부터 고급 패턴까지, 실무에서 활용하는 방법을 알아보겠습니다."
tags: ["React", "Hooks", "JavaScript", "Frontend"]
---

# React Hooks 완벽 가이드

React Hooks는 함수형 컴포넌트에서도 상태 관리와 생명주기를 다룰 수 있게 해주는 강력한 기능입니다.

## 기본 Hooks

### 1. useState

상태 관리의 기본입니다.

\`\`\`javascript
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        증가
      </button>
    </div>
  )
}
\`\`\`

### 2. useEffect

부수 효과를 처리할 때 사용합니다.

\`\`\`javascript
import { useState, useEffect } from 'react'

function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [userId])
  
  return user ? <div>{user.name}</div> : <div>Loading...</div>
}
\`\`\`

## 고급 Hooks

### useCallback과 useMemo

성능 최적화를 위한 핵심 도구들입니다.

\`\`\`javascript
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b)
  },
  [a, b]
)

const memoizedValue = useMemo(
  () => computeExpensiveValue(a, b),
  [a, b]
)
\`\`\`

## 커스텀 Hooks

재사용 가능한 로직을 만들어보세요.

\`\`\`javascript
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })
  
  const setValue = (value) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }
  
  return [storedValue, setValue]
}
\`\`\`

## 마무리

React Hooks를 잘 활용하면 더 깔끔하고 재사용 가능한 컴포넌트를 만들 수 있습니다! `;export{n as default};
