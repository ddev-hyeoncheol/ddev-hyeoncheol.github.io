const n=`---
title: '위상 정렬(Topological Sort) 알고리즘'
date: '2024-03-29'
author: 'ddev-hyeoncheol'
category: 'Algorithm'
excerpt: '방향성 비순환 그래프(DAG) 에서 위상 정렬의 개념과 Kahn's Algorithm, DFS 기반 구현 방법을 예제 및 Python 코드와 함께 정리해 보자.'
tags: ['Algorithm', 'Graph', 'Topological Sort', 'DAG']
prev: ''
next: ''
---

## 📝 개요

Airflow 와 같은 Workflow 관리 도구를 사용할 때, DAG 내에 수백 개의 Task 가 의존성에 맞게 차례로 실행되는 것을 볼 수 있다. 이러한 동작이 가능한 이유는 복잡한 노드 간의 의존성을 **위상 정렬(Topological Sort)** 알고리즘으로 처리하기 때문이다.

이번 포스트에서는 대표적인 위상 정렬 알고리즘인 **Kahn's Algorithm** 과 **DFS 기반 위상 정렬** 방식에 대해 예시를 통해 알아보고, 각각에 대한 Python 코드 구현까지 함께 다뤄보려고 한다.

---

## 위상 정렬(Topological Sort) 이란??

**위상 정렬(Topological Sort)** 은 **방향성이 있는 비순환 그래프(DAG) 에서 모든 노드들을 방향성에 어긋나지 않게 선형적으로 나열하는 알고리즘**이다. 위상 정렬의 조건을 수학적으로 정의하면 다음과 같다.

> 임의의 방향 그래프 $G = (V, E)$ 에서, 모든 간선 $(u, v) \\in E$ 에 대하여 다음 조건을 만족하는 선형 순서 $f$ 를 찾는 것 :
>
> $$\\large f(u) < f(v)$$
>
> 여기서 $f(n)$ 은 노드 $n$ 이 정렬된 리스트에서 차지하는 인덱스 혹은 순서를 의미한다.

즉, **모든 간선의 방향이 왼쪽에서 오른쪽으로 향하도록 노드들을 나열하는 것**이 위상 정렬의 목표이다. 한 가지 흥미로운 특징은, 그래프의 구조에 따라 유효한 **정렬 순서가 여러 개 존재할 수 있다는 점**이다. 이는 데이터 파이프라인이나 빌드 시스템에서 의존성이 없는 특정 태스크들을 **병렬로 처리할 수 있음을 의미**하며, 리소스를 효율적으로 분배하는 근거가 된다.

### DAG (Directed Acyclic Graph)

위상 정렬을 수행하기 위해서 그래프는 반드시 **방향성이 있는 비순환 그래프(DAG, Directed Acyclic Graph)** 여야 한다. DAG 는 다음과 같은 두 가지 속성을 가진다.

- **방향성(Directed)** : 노드 간 간선에 방향이 존재해 우선순위나 흐름이 명확함
- **비순환성(Acyclic)** : 그래프 내에 사이클(Cycle) 이 존재하지 않음

만약 $A \\to B$, $B \\to C$, $C \\to A$ 와 같은 사이클이 존재한다면, $f(A) < f(B) < f(C) < f(A)$ 가 되어 모순이 발생한다. 따라서 사이클이 있는 그래프에서는 선형적인 우선순위를 정의할 수 없으며, 위상 정렬 또한 불가능하다.

---

## 위상 정렬 알고리즘 - Kahn's Algorithm

위상 정렬을 구현하는 대표적인 방법 중 하나인 **Kahn's Algorithm** 은 그래프의 **진입 차수(In-degree)** 를 바탕으로 노드를 정렬한다. 알고리즘의 동작 과정은 다음과 같다.

> 1. 전체 노드의 진입 차수를 계산한다.
> 2. 진입 차수가 0인 노드(Upstream 이 없는 노드)를 전부 Queue 에 넣는다.
> 3. Queue 가 빌 때까지 다음 과정을 반복한다.
>    - Queue 에서 노드 $u$ 를 꺼내 정렬 결과에 추가한다.
>    - 노드 $u$ 와 연결된 모든 간선을 제거한다. ($u$ 와 간선으로 연결된 모든 노드의 진입 차수를 1씩 감소시킨다.)
>    - 간선 제거 후 새롭게 진입 차수가 0이 된 노드를 다시 Queue 에 넣는다.

여기서, 진입 차수란, **방향 그래프에서 특정 노드로 들어오는 간선의 개수**를 의미하며, 반대로 진출 차수는 특정 노드에서 나가는 간선의 개수를 의미한다. 예를 들어 $A \\to C$, $B \\to C$ 일 때, $C$ 는 $A$ 와 $B$ 두 개의 Upstream 노드를 가지므로 **진입 차수(In-degree) 가 2** 가 된다.

Kahn's Algorithm 의 가장 큰 장점은, **정렬과 동시에 사이클을 탐지할 수 있다는 점**이다. 사이클에 포함된 노드들은 서로를 선행 조건으로 가지므로 진입 차수가 0이 될 수 없고, Queue 에 삽입되지 못한 채 알고리즘이 종료된다. 따라서 정렬 결과 리스트의 길이가 전체 노드의 수보다 적다면 그래프에 사이클이 존재한다는 것을 알 수 있다.

알고리즘의 동작 과정을 예시 그래프를 통해 설명하면 아래와 같다.

### Step 1. 그래프 초기화 및 전체 노드의 진입 차수 계산

![](https://res.cloudinary.com/ddev-hyeoncheol/image/upload/f_auto,q_auto/v1771483457/topological-sort-graph-1_gv3avt.png)

먼저, 전체 그래프를 탐색해 각 노드의 **진입 차수(In-degree)** 를 계산한다. 위상 정렬에서 진입 차수는 특정 노드를 방문(Task 시작) 하기 위해 먼저 방문해야 하는 노드의 수(선행 작업의 수) 를 의미한다. 위 그래프 예시에서 각 노드의 진입 차수를 계산하면 아래와 같다.

| 노드      | A   | B   | C   | D   | E   | F   | G   | H   |
| --------- | --- | --- | --- | --- | --- | --- | --- | --- |
| 진입 차수 | 0   | 0   | 2   | 2   | 2   | 1   | 1   | 2   |

### Step 2. 진입 차수가 0인 노드 식별 및 Queue 삽입

![](https://res.cloudinary.com/ddev-hyeoncheol/image/upload/f_auto,q_auto/v1772504160/topological-sort-graph-2_b36cok.png)

계산된 진입 차수를 바탕으로, 차수가 0인 노드를 찾아 Queue 에 삽입한다. 이 노드들은 Upstream 이 존재하지 않아 즉시 방문 가능한 상태임을 의미한다. 예시 그래프에서는 노드 $A$ 와 $B$ 가 Queue 에 삽입되며, 이들은 각각 독립적인 시작점이 될 수 있다. **어떤 노드를 먼저 처리하는가에 따라 최종 정렬 결과가 달라질 수 있고**, 이 때문에 위상 정렬의 결과가 단 하나의 정답만을 가지지 않는 것이다.

현재 Step 에서 실행 대기열 \`Queue\` 와 정렬 결과 리스트 \`Sorted\` 의 상태는 다음과 같다.

- \`Queue\` : [$A$, $B$]
- \`Sorted\` : [ ]

### Step 3. 노드 정렬 및 의존성(진입 차수) 업데이트

![](https://res.cloudinary.com/ddev-hyeoncheol/image/upload/f_auto,q_auto/v1772504160/topological-sort-graph-3_qnl81v.png)

이제 Queue 가 빌 때까지 노드를 추출하고 의존성을 업데이트하는 과정을 반복한다. 먼저 Queue 에서 노드 $A$ 를 꺼내어 처리한다고 가정해 보자.

1. 노드 방문 처리 : Queue 에서 노드 $A$ 를 꺼내 정렬 결과에 추가한다.
2. 의존성 제거 : 노드 $A$ 와 연결된 모든 간선을 제거하고, 간선으로 연결되어 있던 노드 $C$, $D$ 의 진입 차수를 각각 1씩 감소시킨다.
   - 노드 $C$ : 진입 차수 2 → 1
   - 노드 $D$ : 진입 차수 2 → 1
3. 신규 노드 투입 : 간선 제거 후 새롭게 진입 차수가 0이 된 노드를 다시 Queue 에 넣는다. (이번 회차에서는 노드 $C$, $D$ 모두 진입 차수가 1이므로 Queue 에 추가되지 않음)

첫 번째 회차를 마친 후 실행 대기열 \`Queue\` 와 정렬 결과 리스트 \`Sorted\` 의 상태는 다음과 같다.

- \`Queue\` : [$B$]
- \`Sorted\` : [$A$]

동일한 논리로 회차를 반복해 모든 노드를 방문했을 때, \`Queue\` 와 \`Sorted\` 리스트의 변화를 정리하면 다음 테이블과 같다.

| 회차      | 추출 노드 | Queue           | Sorted                                   |
| --------- | --------- | --------------- | ---------------------------------------- |
| 초기 상태 | -         | [$A$, $B$]      | [ ]                                      |
| 1회차     | $A$       | [$B$]           | [$A$]                                    |
| 2회차     | $B$       | [$C$]           | [$A$, $B$]                               |
| 3회차     | $C$       | [$D$, $E$]      | [$A$, $B$, $C$]                          |
| 4회차     | $D$       | [$E$, $G$, $F$] | [$A$, $B$, $C$, $D$]                     |
| 5회차     | $E$       | [$G$, $F$]      | [$A$, $B$, $C$, $D$, $E$]                |
| 6회차     | $G$       | [$F$]           | [$A$, $B$, $C$, $D$, $E$, $G$]           |
| 7회차     | $F$       | [$H$]           | [$A$, $B$, $C$, $D$, $E$, $G$, $F$]      |
| 8회차     | $H$       | [ ]             | [$A$, $B$, $C$, $D$, $E$, $G$, $F$, $H$] |

### 시간 복잡도 분석

Kahn's Algorithm 은 **모든 노드($V$) 와 간선($E$) 을 정확히 한 번씩 확인**하기 때문에 매우 효율적이며, 시간 복잡도는 다음과 같다.

<br>

$$\\Large O(V + E)$$

<br>

### Kahn's Algorithm 의 Python 코드 구현

노드 간의 연결 관계를 표현한 인접 리스트가 주어졌을 때, Kahn's Algorithm 을 간단히 구현하면 아래와 같다. 여기서 **Queue 가 빌 때까지 모든 노드를 방문하지 못했다면, 그래프에 사이클이 존재**하는 것으로 간주할 수 있다.

\`\`\`python
from collections import deque

def topological_sort(v, adj):
    """
    v  : 노드의 개수 (ex: 8)
    adj: 인접 리스트 (ex: { 1: [3, 4], 2: [3, 5], ...})
    """
    # 1. 진입 차수(In-degree) 계산
    in_degree = [0] * (v + 1)
    
    for i in range(1, v + 1):
        for neighbor in adj[i]:
            in_degree[neighbor] += 1

    # 2. 진입 차수가 0인 노드를 Queue에 삽입
    queue = deque([i for i in range(1, v + 1) if in_degree[i] == 0])
    result = []

    # 3. Queue가 빌 때까지 반복
    while queue:
        current = queue.popleft()
        result.append(current)

        # 연결된 노드들의 진입 차수 감소
        for neighbor in adj[current]:
            in_degree[neighbor] -= 1
            # 새롭게 0이 된 노드를 Queue에 삽입
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    # 모든 노드를 방문하지 못했다면 사이클이 존재함
    if len(result) != v:
        return "Cycle detected!"

    return result
\`\`\`

---

## 위상 정렬 알고리즘 - DFS

Kahn's Algorithm 외에도 **DFS(깊이 우선 탐색)** 를 활용해 위상 정렬을 구현할 수 있다. 이 방식은 **특정 노드에서 출발해 갈 수 있는 가장 먼 노드까지 탐색을 마친 뒤, 탐색이 종료되는 순서의 역순으로 노드를 나열**하는 것이 핵심이다. 알고리즘의 동작 과정은 다음과 같다.

> 1. 방문하지 않은 임의의 노드를 선택해 DFS 탐색을 시작한다.
> 2. 현재 노드와 연결된 인접 노드들을 재귀적으로 방문한다.
> 3. 더 이상 방문할 인접 노드가 없다면, 현재 노드를 Stack 에 넣는다.
> 4. 모든 노드를 방문할 때까지 위 과정을 반복한다.
> 5. 탐색이 모두 종료된 후, Stack 에 담긴 노드들을 하나씩 꺼내어 정렬 결과에 추가한다.

### 시간 복잡도 분석

**모든 노드($V$) 와 간선($E$) 을 한 번씩 확인**하므로 시간 복잡도는 Kahn's Algorithm 과 동일하다.

<br>

$$\\Large O(V + E)$$

<br>

### DFS 의 Python 코드 구현

DFS 기반 위상 정렬 알고리즘은 별도의 상태 배열이 존재하지 않으면 **사이클을 명시적으로 탐지하지 못한다**. 아래 코드는 사이클 검출 로직을 생략한 기본적인 DFS 기반 위상 정렬 알고리즘의 구현이다.

\`\`\`python
def topological_sort(v, adj):
    """
    v  : 노드의 개수 (ex: 8)
    adj: 인접 리스트 (ex: { 1: [3, 4], 2: [3, 5], ...})
    """
    visited = [False] * (v + 1)
    stack = []
    
    def dfs(now):
        visited[now] = True
        
        # 2. 현재 노드 및 인접한 노드들을 재귀 방문
        for neighbor in adj[now]:
            if not visited[neighbor]:
                dfs(neighbor)
        
        # 3. 방문할 인접 노드가 없다면 Stack 에 삽입
        stack.append(now)
    
    # 4. 모든 노드를 방문할 때까지 반복
    for i in range(1, v + 1):
        # 1. 임의의 노드에서 DFS 탐색 시작
        if not visited[i]:
            dfs(i)
    
    # 5. Stack 에 담긴 노드들을 역순으로 꺼내어 결과 반환
    return stack[::-1]
\`\`\`

### Kahn's Algorithm vs DFS 기반 위상 정렬

실제 Scheduler 와 같은 기능을 구현할 때는 **보통 Kahn's Algorithm 으로 구현**한다. 그 이유는 현재 **실행 가능한 Task 를 Queue 에 담아 즉시 Worker 에 할당할 수 있는 구조**이고, 동작 방식 자체가 **병렬 처리 시스템의 Workflow 와 일치**해 실시간으로 실행 가능한 작업을 추출할 수 있기 때문이다.

반면, DFS 를 활용한 위상 정렬은 **모든 재귀 탐색이 완료되어야 전체 실행 순서를 확정**할 수 있기 때문에, 스케줄링보다는 **순수한 그래프 탐색이나 정적인 종속성 분석 작업**에 주로 사용된다.



## 📚 요약 / 마무리

- **위상 정렬(Topological Sort)** 은 **방향성이 있는 비순환 그래프(DAG) 에서 모든 노드들을 방향성에 어긋나지 않게 선형적으로 나열하는 알고리즘**이다.
- 위상 정렬의 구현 방식으로는 진입 차수를 활용하는 **Kahn's Algorithm** 과 재귀 탐색을 활용하는 **DFS 기반 위상 정렬 알고리즘**이 있다.
- 특히, Kahn's Algorithm 은 **병렬 처리 시스템의 Workflow 와 동작 방식이 일치**해, **Scheduler 와 같은 기능을 구현할 때 일반적으로 사용**된다.
`;export{n as default};
