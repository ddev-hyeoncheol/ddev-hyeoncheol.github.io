const n=`---
title: 'MPP(Massively Parallel Processing) 엔진에서의 쿼리 최적화 가이드'
date: '2024-02-16'
author: 'ddev-hyeoncheol'
category: 'Data Engineering'
excerpt: 'Impala, Trino 와 같은 MPP 엔진의 분산 처리 효율을 극대화하는 쿼리 최적화 전략에 대해 예시를 통해 알아보자.'
tags: ['Data Engineering', 'Query Optimization', 'SQL', 'MPP']
prev: 'massively-parallel-processing'
next: ''
---

## 📝 개요

실무에서 **[MPP(Massively Parallel Processing)](https://ddev-hyeoncheol.github.io/posts/massively-parallel-processing)** 쿼리 엔진을 사용하다 보면, 동일한 데이터와 클러스터 환경임에도 쿼리 작성 방식에 따라 성능이 천차만별로 달라지는 상황을 자주 경험하게 된다. 이는 MPP 엔진의 특성상, 연산 자체보다 **'얼마나 많은 데이터를 스캔하는가'** 와, **'그 데이터를 노드 간에 어떻게 이동(Shuffle)시키는가'** 가 전체 쿼리 성능을 결정하기 때문이다. 이번 포스트에서는 Partitioning, Bucketing 과 같은 아키텍처 설계 관점은 제외하고, **쿼리 레벨에서 제어가 가능한 성능 최적화 기법**들을 중심으로 정리해 보려고 한다.

---

## 1. Predicate Pushdown (필터 조기 적용)

**Predicate Pushdown** 은 **필터 조건(\`WHERE\`)을 스캔 단계에서 최대한 빨리 적용해, 스토리지에서 읽어야 할 데이터 볼륨을 줄이는 기법**이다. 일반적인 쿼리 실행 흐름은 다음과 같다.

1. 스토리지에서 데이터 스캔 (**I/O 발생**)
2. 스캔한 데이터를 노드 메모리로 로드 (**네트워크 및 메모리 사용**)
3. Join, Aggregation 등의 연산 수행 (**CPU 자원 소모**)

필터 조건이 늦게 적용될수록 이후 연산 단계에서의 비용이 누적되어 증가하므로, Predicate Pushdown 은 적용 시 효과가 가장 큰 최적화 기법 중 하나다.

#### 쿼리 예시

\`\`\`sql
SELECT *
FROM sales
WHERE sale_date = '2024-02-16';
\`\`\`

### 주의할 점 : SARG(Search Arguments) 위반

컬럼을 함수로 감싸거나 가공하면, 저장소 수준의 인덱스나 파일 메타데이터를 활용할 수 없어 Full Scan 이 발생할 가능성이 높아진다.

\`\`\`sql
-- 잘못된 예시
SELECT *
FROM sales
WHERE year(sale_date) = '2024';
\`\`\`

\`\`\`sql
-- 수정된 예시
SELECT *
FROM sales
WHERE sale_date >= '2024-01-01' and sale_date < '2025-01-01';
\`\`\`

---

## 2. Projection Pruning (컬럼 선택 최소화)

Projection Pruning 은 **쿼리 결과에 실제로 필요한 컬럼만 선택해, 스토리지에서 읽어야 할 데이터 볼륨을 줄이는 기법**이다. 특히 Parquet, ORC 와 같은 **컬럼 기반(Column-based, Columnar) 저장 Format 에서 효과가 크다**. Predicate Pushdown 이 행(Row)을 줄이는 작업이라면, Projection Pruning 은 열(Column)을 줄이는 작업이라 할 수 있다.

#### 쿼리 예시

\`\`\`sql
-- 잘못된 예시
SELECT *
FROM sales
WHERE sale_date = '2024-02-16';
\`\`\`

\`\`\`sql
-- 수정된 예시
SELECT order_id, customer_id, amount
FROM sales
WHERE sale_date = '2024-02-16';
\`\`\`

---

## 3. JOIN 최적화

JOIN 은 MPP 환경에서 가장 많은 데이터의 이동(Shuffle) 을 유발하는 무거운 연산이다. 나중에 다시 설명하겠지만, **Shuffle 이란 데이터를 JOIN 키나 GROUP BY 키 기준으로 노드 간에 재분배하는 과정**을 의미하며, 이 과정의 효율성이 쿼리 전체 성능을 좌우한다.

또, JOIN 성능 저하의 주요 원인 중 하나는 **데이터 스큐(Data Skew)**로, 특정 JOIN 키에 데이터가 과도하게 몰려, 해당 키를 할당받은 **특정 노드(Task) 만 과부하가 걸리는 현상**을 의미한다. MPP 환경에서는 가장 시간이 많이 걸리는 노드의 실행 시간이 곧 전체 쿼리 시간이 되므로 매우 중요하다.

### 3-1. Broadcast JOIN 활용 (작은 테이블 + 큰 테이블 JOIN)

Boradcast JOIN 은 크기가 작은 테이블을 모든 노드에 복사해, 대용량 테이블의 Shuffle 을 방지하는 방법이다. 통계 정보의 부족이나 메타데이터가 없는 등 다양한 이유로 Optimizer 가 작은 테이블을 인식하지 못한다면 **쿼리 힌트를 통해 명시적으로 지정**할 수 있다.

#### 쿼리 예시 (Impala Query Hint 사용 예시)

\`\`\`sql
SELECT *
FROM sales s
INNER JOIN /* +BROADCAST */ customer c
    ON s.customer_id = c.customer_id;
\`\`\`

> Note : 위 예시는 Impala 쿼리 예시로, 엔진에 따라 힌트 표기 방식이 다를 수 있다. \`BROADCAST\` 외에도 Shuffle JOIN 또한 \`SHUFFLE\` 과 같이 명시할 수 있다.

### 3-2. JOIN 순서 최적화

대부분의 MPP 엔진에서는 JOIN 시 \`FROM\` 절의 테이블을 고정(Probe Side)하고, JOIN 테이블을 메모리에 올려(Build Side) 연산을 수행한다. 이 때, Build Side 가 과도하게 커지면 메모리 부족(OOM)이 발생할 수 있다. 따라서 일반적으로는 가장 큰 테이블을 기준 테이블로 두고, 필터 조건으로 **결과 행 수가 가장 많이 줄어드는 테이블을 JOIN 순서의 앞부분에 배치**하고, 상대적으로 **작은 테이블부터 JOIN** 하는 것이 효과적이다.

### 3-3. Data Skew 방지

Data Skew 를 방지하기 위해 **키 값에 대한 필터링**이나 **Salting 기법**을 사용해 해결할 수 있다.

#### 쿼리 예시 (키 값 필터링)

\`\`\`sql
-- NULL 키 값 제거를 통한 간단한 Skew 완화
SELECT *
FROM sales
INNER JOIN customer c
    ON s.customer_id = c.customer_id
WHERE s.customer_id is not NULL;
\`\`\`

#### 쿼리 예시 (Salting)

Salting 은 **JOIN 키에 무작위 값을 결합해 인위적으로 분산**시켜 Skew 를 근본적으로 완화하는 방법이다.

- 장점 : 특정 노드에 부하가 집중되는 Data Skew 문제를 근본적으로 해결할 수 있다. Query Timeout 이나 OOM 에러를 방지할 수 있다.
- 단점 : 상대 테이블을 복제해야 하므로 스토리지나 메모리 사용량이 증가하고, 쿼리가 복잡해져 유지 보수가 어려워진다.

\`\`\`sql
-- Salting 을 활용한 Skew 완화
SELECT s.*, c.customer_name
FROM (
  SELECT *, concat(customer_id, '_', cast(rand() * 10 as int)) as salted_key
  FROM sales
) s
INNER JOIN (
  SELECT *, concat(customer_id, '_', n) as salted_key
  FROM customer
  CROSS JOIN (SELECT explode(sequence(0, 9)) as n)
) c
    ON s.salted_key = c.salted_key;
\`\`\`

---

## 4. Aggregation 최적화

대규모 데이터의 \`GROUP BY\` 나 \`COUNT DISTINCT\` 연산은 대량의 Shuffle 을 유발해 성능 저하의 주요 원인이 된다. 이 경우, 데이터를 단계적으로 줄여나가는 전략이 효과적이다.

### 4-1. Partial Aggregation

\`COUNT DISTINCT\` 와 같은 연산은 모든 고유값을 노드 간에 셔플링해야 하므로 매우 무거운 작업이다. 이를 여러 단계로 나누어 집계하면 병렬 처리 효율을 높일 수 있다.

#### 쿼리 예시

\`\`\`sql
-- 잘못된 예시
SELECT category, count(distinct product_name)
FROM sales
GROUP BY category;
\`\`\`

\`\`\`sql
-- 수정된 예시
SELECT category, count(product_name)
FROM (
    SELECT category, product_name
    FROM sales
    GROUP BY category, product_name
) sales_agg
GROUP BY category;
\`\`\`

### 4-2. Incremental Aggregation

이미 계산된 집계 결과가 존재하는데도 매번 Raw 데이터를 다시 스캔하는 것은 불필요한 비용이다. **집계 테이블을 단계적으로 구성해 재활용하는 패턴을 습관화하는 것이 중요**하다.

#### 쿼리 예시

\`\`\`sql
-- 잘못된 쿼리 예시
-- 주간 집계 쿼리
SELECT category, count(1) as sale_count
FROM sales
WHERE sale_date >= '2024-02-16' and sale_date < '2024-02-23'
GROUP BY category;

-- 월간 집계 쿼리
SELECT category, count(1) as sale_count
FROM sales
WHERE sale_date >= '2024-02-01' and sale_date < '2024-03-01'
GROUP BY category;
\`\`\`

\`\`\`sql
-- 수정된 쿼리 예시
INSERT INTO daily_sales_summary
SELECT sale_date, category, count(1) as sale_count
FROM sales
GROUP BY sale_date, category;

-- 주간 집계 쿼리
SELECT category, sum(sale_count) as sale_count
FROM daily_sales_summary
WHERE sale_date >= '2024-02-16' and sale_date < '2024-02-23';
GROUP BY category;
\`\`\`

---

## 📚 요약 / 마무리

- MPP 환경에서의 쿼리 성능 최적화는 **데이터의 스캔량을 줄이고**, **데이터의 이동(Shuffle) 의 최소화**하는 것이 핵심이다.
- 실제 환경에서는 반드시 **Query Execution Plan** 을 확인해 어떤 단계에서 병목이 발생하는 지 지속적으로 점검하는 습관이 필요하다.
`;export{n as default};
