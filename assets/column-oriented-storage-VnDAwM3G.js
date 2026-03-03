const n=`---
title: '컬럼 기반(Column-based) 저장 방식'
date: '2024-01-05'
author: 'ddev-hyeoncheol'
category: 'Data Engineering'
excerpt: '대용량 데이터 분석에 필수적인 컬럼 기반(Column-based) 저장 방식의 개념과 특징을 알아보고, Row-based 방식과 비교해 보자.'
tags: ['Data Engineering', 'Database', 'Column-based', 'OLAP']
prev: ''
next: ''
---

## 📝 개요

데이터 엔지니어링 과정에서, 엔지니어는 데이터를 분석 환경 스토리지에 저장하기 위해 적당한 포맷을 선택한다. 대부분의 OLAP 환경에서는 **Parquet, ORC** 와 같은 **컬럼 기반(Column-based, Columnar) 저장** 포맷을 사용해 데이터를 저장하는데, 그 이유는 무엇이고 이를 통해 얻을 수 있는 이점에는 뭐가 있을지 간단히 알아보고자 한다.

---

## 컬럼 기반 저장 방식이란??

컬럼 기반(Column-based, Columnar) 저장 방식이란, 데이터베이스 테이블의 데이터를 행(row) 단위가 아닌 **열(column) 단위로 묶어서 저장**하는 아키텍처를 의미한다. MySQL, PostgreSQL 과 같은 전통적인 관계형 데이터베이스에서는 키 값에 해당하는 모든 정보를 하나의 row 단위로 저장하는 반면, 컬럼 기반 저장 방식은 각 열을 따로 저장한다. 이를 그림으로 간단히 표현하면, 아래와 같이 나타낼 수 있다.

![rdb-vs-columnar-database-structure](https://res.cloudinary.com/ddev-hyeoncheol/image/upload/f_auto,q_auto/v1769142104/row-vs-column-storage_jcx545.png)

### 주요 특징 및 장점

#### **1. I/O 효율성**

기존 행(Row) 기반 방식은 특정 컬럼 하나만 필요해도 전체 행을 모두 읽어야 해서 불필요한 I/O 가 발생하는 데 반해, 컬럼 기반 방식은 **쿼리에 필요한 특정 열(Column) 만 스토리지에서 읽어오는 것이 가능**하기 때문에, 데이터 스캔 양을 줄이고 분석 속도를 높일 수 있다.

#### 2. 높은 압축(Compression) 효율

같은 열에는 **동일한 데이터 타입(ex. integer, date, string 등)의 값**들이 모여 있기 때문에 압축 효율이 매우 높고, **[RLE(Run-Length Encoding)](https://en.wikipedia.org/wiki/Run-length_encoding)** 와 같은 알고리즘을 사용한다면 디스크 저장 공간을 절약할 뿐 아니라 I/O 대역폭 또한 아낄 수 있다.

#### 3. 집계 연산 최적화 (Analytics Performance)

데이터베이스 내 "모든 사람들의 평균 나이"나 "지역별 인구 분포"와 같은 집계 연산(ex. Sum, Avg, Count 등)을 수행할 때, 관련된 **컬럼 데이터가 물리적으로 인접해 있어 처리가 매우 빠르고 CPU 캐시의 적중률이 높다**.

---

## Row-based vs Column-based

앞서 간단히 설명한 것처럼, Row-based 저장 방식과 Column-based 저장 방식은 물리적인 구조가 완전히 다르기 때문에, **데이터가 어떻게 사용되는지**에 따라 명확하게 용도가 나뉜다. 이를 흔히 **OLTP(Online Transaction Processing)** 와 **OLAP(Online Analytical Processing)** 의 차이로 설명할 수 있다.

### Row-based 와 OLTP

은행 앱에서 계좌를 조회하거나 쇼핑몰에서 상품을 주문하는 것처럼 **데이터의 생성(Create), 수정(Update), 삭제(Delete) 가 빈번하게 일어나는 환경**을 생각해 보자. 이러한 시스템에서는 \`ID\` 와 같은 특정한 키 값에 연결된 **여러 속성(컬럼)들을 한 번에 조회**해야 하고, 수많은 사용자가 동시에 데이터에 접근해서 생성/수정하는 만큼 **데이터의 무결성(Integrity)이 보장**되어야 한다.

이 경우, Row-based 방식은 한 행(Row) 의 데이터가 물리적인 공간에 연속적으로 저장되어 있기 때문에, 헤드가 한 번만 움직이면 해당 사용자의 모든 컬럼 데이터를 한번에 로드할 수 있다. 또, \`Insert\` 나 \`Update\` 와 같은 쓰기 작업 역시 빠르게 처리할 수 있어, 이러한 **OLTP(Online Transaction Processing) 중심 환경에 매우 적합**하다.

### Column-based 와 OLAP

반면, 데이터 분석가는 "지난 달에 가입한 사용자들의 평균 나이와 거주지 분포" 와 같이 데이터 집합에서 **특정 컬럼만을 대상으로 하는 집계 작업**에 관심이 있는데, 이 과정에서 이메일 주소나 생일과 같은 나머지 속성들은 분석 과정에 전혀 필요하지 않다.

이 경우, Column-based 방식은 각 컬럼이 물리적으로 독립된 공간에 저장되어 있기 때문에 필요한 컬럼만 선택적으로 읽어올 수 있고, 이는 읽어야 할 데이터의 총량(I/O)을 줄여 주고 데이터의 압축 효율 또한 높기 때문에 수억 건의 데이터를 처리해야 하는 **OLAP(Online Analytical Processing) 환경에서 압도적인 성능을 발휘**한다.

### Row-based, Column-based 의 비교

| 구분                | **행 기반 (Row-based)**                                           | 열 기반 (Column-based)                                  |
| ------------------- | ----------------------------------------------------------------- | ------------------------------------------------------- |
| **주요 작업**       | 단일 레코드의 조회 및 빈번한 트랜잭션<br />(Create/Update/Delete) | 대규모 데이터 스캔 및 집계 분석<br />(Scan/Aggregation) |
| **I/O 효율성**      | 한 행의 모든 컬럼을 읽어야 함                                     | 필요한 컬럼만 선택적으로 읽을 수 있음                   |
| **응답 속도**       | 개별 레코드의 조회 및 트랜잭션 시 빠름                            | 대규모 데이터 통계/계산 시 압도적으로 빠름              |
| **압축 효율**       | 상대적으로 낮음                                                   | 매우 높음 (유사 데이터 집약)                            |
| **적합한 워크로드** | OLTP (Online Transaction Processing)                              | OLAP (Online Analytical Processing)                     |

---

## 대표적인 Column-based 파일 포맷

### Apache Parquet

Twitter 와 Cloudera 가 협력해 개발한 오픈소스 포맷으로, 가장 **범용적으로 사용되는 표준 포맷**이다.

- **광범위한 호환성** : Apache Spark, Hive, Impala, Presto/Trino, AWS Athena, Google BigQuery 등 대부분의 빅데이터 처리 프레임워크와의 호환성이 매우 뛰어나다.
- **Nested Data 처리** : Google 의 Dremel 논문 **[record shredding and assembly algorithm](https://github.com/julienledem/redelm/wiki/The-striping-and-assembly-algorithms-from-the-Dremel-paper)** 에 기초한 알고리즘을 사용해, JSON, Map 등과 같이 복잡한 계층 구조를 가진 Nested Data 를 효율적으로 저장하고 조회하는 데 강점이 있다.
- **Metadata 구조** : Parquet 포맷은 파일 내부를 **Row Group → Column Chunk → Page** 의 구조로 나누고, 각 단위에 대해 Min, Max, Null Count 등의 통계 메타데이터를 저장해 여러 엔진에서의 일관된 성능 특성을 보이는 데 강점이 있다.

### Apache ORC (Optimized Row Columnar)

Hortonworks 와 Facebook 이 협력해 개발한 포맷으로, **Hadoop, Hive 환경에서의 성능을 극대화하기 위해 설계된 포맷**이다.

- **최고 수준의 압축 효율** : 데이터 타입별로 최적화된 인코딩 방식과 Stripe 단위 저장 구조를 사용해, 일반적으로 Parquet 보다 더 높은 압축률을 보여준다.
- **Hive ACID 트랜잭션 지원** : Hive 환경에서 데이터의 ACID 트랜잭션(Insert / Update / Delete / Merge) 기능을 지원하는 사실상 유일한 스토리지 포맷이다.
- **경량 인덱스 내장** : 파일 내부에 Bloom Filter 와 같은 경량 인덱스를 내장하고 있어서, \`col = value\` 와 같이 특정한 값을 검색하는 쿼리에서 매우 빠른 속도를 낸다.

---

## 📚 요약 / 마무리

- **컬럼 기반(Column-based, Columnar)** 저장 방식은 **I/O 효율성, 높은 압축 효율, 집계 연산 최적화와 같은 이점을 제공**한다.
- 이러한 컬럼 기반 저장 방식의 이점들은 **대규모 데이터 스캔과 집계 분석이 핵심인 OLAP 환경의 성능을 극대화**할 수 있다.
- 대표적인 컬럼 기반 파일 포맷으로는 **Apache Parquet 와 Apache ORC** 가 있다.
`;export{n as default};
