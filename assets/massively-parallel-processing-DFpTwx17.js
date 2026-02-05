const n=`---
title: 'MPP(Massively Parallel Processing) 아키텍처'
date: '2024-01-26'
author: 'ddev-hyeoncheol'
category: 'Data Engineering'
excerpt: '데이터를 물리적으로 분할해 독립적으로 처리하는 MPP(Massively Parallel Processing) 아키텍처의 개념 및 그 활용에 대해 알아보자.'
tags: ['Data Engineering', 'Distributed Computing', 'MPP']
prev: ''
next: ''
---

## 📝 개요

OLAP 기반 데이터 분석 환경에서 Impala, Presto/Trino 와 같은 분산 쿼리 엔진을 처음 사용했을 때, 수십억 건의 데이터를 고작 몇 초만에 집계하는 것을 보고 무척이나 신기해했던 경험이 있다. 이러한 처리 속도의 핵심은 쿼리 엔진이 **MPP(Massively Parallel Processing, 대규모 병렬 처리)** 아키텍처로 구성되어 있기 때문인데, 이번 포스트에서는 데이터 엔지니어링에서 핵심이라 할 수 있는 MPP 아키텍처의 개념과 특징, 활용 사례에 대해서 알아보고자 한다.

---

## MPP(Massively Parallel Processing) 란??

**MPP(Massively Parallel Processing)** 는 **대규모 병렬 처리**의 약자로, **Shared-Nothing Architecture** 를 기반으로 독립적인 CPU, 메모리, 운영체제, 스토리지를 갖춘 여러 개의 노드들이 네트워크로 연결되어 하나의 거대한 **단일 작업을 병렬로 동시에 처리하는 분산 컴퓨팅 아키텍처**를 의미한다. 이는 자원 간 공유를 최소화하고 데이터와 연산을 클러스터 전체에 분산시키며, 노드를 추가할수록 처리 성능이 선형적으로 확장되는 **수평적 확장(Scale-out)** 방식을 핵심 개념으로 **대용량 데이터에 대한 처리 성능을 비약적으로 향상**시키는 데 그 목적이 있다.

### MPP 아키텍처의 특징

MPP 아키텍처는 다음과 같은 구조적 설계를 통해 고성능을 구현한다.

#### 1. Shared-Nothing Architecture

**[Shared-Nothing Architecture](https://en.wikipedia.org/wiki/Shared-nothing_architecture)** 는 각 노드가 CPU, 메모리, 디스크 등과 같은 **하드웨어 자원을 완전히 독립적으로 소유하고 관리**하는 방식이다. 서로 다른 노드가 하드웨어 자원을 공유하면서 발생하는 **병목 현상을 근본적으로 차단**해, 각 노드가 다른 노드의 상태와는 관계없이 할당된 작업만을 처리해 대규모 클러스터에서도 **간섭이 없이 효율적인 병렬 처리를 보장**한다.

#### 2. Data Distribution (데이터 분산)

전체 데이터셋을 해싱(Hashing)이나 라운드 로빈(Round Robin)과 같은 **특정 규칙에 따라 여러 노드에 분산 저장**한다. 이러한 분산 방식은 특정 노드에만 작업이 쏠리는 **데이터 스큐(Data Skew) 현상을 방지**하며, 쿼리가 실행될 때 모든 노드의 I/O 성능을 동시에 가용해 **시스템 전체 처리량을 극대화**한다.

#### 3. Parallel Query Processing (병렬 쿼리 처리)

사용자가 쿼리를 요청하면 시스템은 이를 여러 개의 작은 실행 단위인 **Fragment** 로 분리해 모든 노드에서 동시에 실행하는 병렬 쿼리 처리 방식을 사용한다. 이는 **[분할 정복(Divide and Conquer)](https://en.wikipedia.org/wiki/Divide-and-conquer_algorithm)** 개념을 쿼리 엔진에 적용한 것으로, 단일 서버로는 감당하기 힘든 대용량 연산을 수많은 노드가 나누어 처리함으로써 **응답 속도를 비약적으로 단축시키고 대규모 데이터 분석이 가능**해진다.

#### 4. Scalability / Scale-Out (선형적 확장성)

시스템 성능이 한계에 도달했을 때, 기존 서버의 사양을 높이는 대신 새로운 노드를 추가하는 것 만으로 처리 능력을 향상시킬 수 있는 **선형적 확장성(Scalability)** 을 제공한다. 데이터 양이 급증하더라도 서버를 늘리는 만큼 **연산 능력과 저장 공간이 선형적으로 증가**하기 때문에, 유연하고 안정적으로 대응할 수 있는 환경을 구축할 수 있다.

### Impala 에서의 쿼리 실행 흐름 예시

아래 그림은 MPP 아키텍처로 구성된 Impala 쿼리 엔진에서 쿼리가 실행되는 과정을 보여 준다.

![impala-query-flow-diagram](https://res.cloudinary.com/dmludowia/image/upload/f_auto,q_auto/v1769494147/impala-query-flow-diagram_qre3de.webp)

Impala 에서 쿼리 요청(Submission) 이 발생하는 상황을 가정해 보자. 사용자가 쿼리를 요청하면, **Coordinator 노드**는 쿼리를 분석해 최적의 실행 계획(Query Plan)을 생성한다. 생성된 실행 계획은 여러 개의 실행 단위인 Fragment 로 쪼개져 클러스터 내의 각 **Executor 노드**로 배포된다. 각 Executor 들은 할당된 실행 단위에 대해 병렬로 연산을 수행하며, 계산된 중간 결과 또는 최종 결과를 다시 Coordinator 에 반환한다. 최종적으로 Coordinator 노드는 이 결과들을 병합(Aggregation / Merge)하여 최종 결과를 생성하고, 이를 사용자에게 반환한다.

> **Note** : Impala 에서는 기본적으로 모든 노드가 **Coordinator 와 Executor 의 역할을 동시에 수행**할 수 있다.

Impala 쿼리가 실행되는 일련의 과정에서 앞서 말한 MPP 의 특징들을 확인할 수 있는데, 우선 Impala 내 각 노드는 CPU, 메모리, 스토리지를 독립적으로 점유하는 **Shared-Nothing Architecture** 를 통해 자원 경합에 따른 병목 현상을 원천적으로 차단하고, 데이터를 클러스터 전체에 나누어 저장하는 **데이터 분산(Data Distribution)** 으로 모든 노드의 I/O 성능을 균일하게 가용하고 있다. 연산 단계에서는 작업을 Fragment 단위로 세분화해 동시에 실행하는 **병렬 쿼리 실행(Parallel Query Processing)** 으로 대규모 연산 속도를 극대화하고, 성능의 확장이 필요한 경우 단순히 새로운 노드를 추가하는 것만으로도 처리 능력을 선형적으로 증가시킬 수 있는 **확장성(Scalability)** 을 제공하고 있다.

---

## MPP 아키텍처의 활용

MPP 아키텍처는 데이터 엔지니어링 과정의 핵심인 **분산 쿼리 엔진**과 **데이터 웨어하우스** 등에 광범위하게 활용되는데, 대표적인 몇 가지를 예시로 알아 보자.

#### Apache Impala & Presto (Open Source)

Hadoop ecosystem 에서 실시간 분석을 위한 대표적인 오픈소스 쿼리 엔진들이다. 두 엔진의 **가장 큰 차이점은 Storage - Computing 의 결합 방식**에 있다.

- **Apache Impala** : 기존 **MapReduce 의 느린 속도를 극복하기 위해 등장**했으며, HDFS 의 **데이터 노드에서 직접 데이터를 처리하는 전형적인 MPP 구조**를 통해 최소한의 네트워크 전송만으로 대용량 데이터에 대한 쿼리 속도를 보장한다.
- **Presto** : Facebook 에서 개발한 쿼리 엔진으로, HDFS 뿐 아니라 S3, NoSQL 등 다양한 소스를 연결해 **동일한 쿼리로 병렬 분석**을 할 수 있다. 데이터 레이크(Data Lake) 환경에서 확장성이 뛰어난 MPP 엔진으로 평가받는다.

#### Amazon Redshift (Cloud Data Warehouse)

- **클라우드 환경에서 MPP 아키텍처를 구현**한 대표적인 데이터 웨어하우스로, 대규모 데이터를 노드 단위로 분산 저장하고 병렬 스캔하여 분석 성능을 제공한다. 특히 대량의 정형 데이터를 분석할 때 강력한 성능을 발휘한다.

#### Snowflake (Cloud Data Platform)

- **저장소와 연산을 분리한 클라우드 데이터 플랫폼**으로, 내부적으로는 MPP 기반의 Virtual Warehouse 를 통해 대규모 병렬 쿼리 처리를 수행한다.

#### Google BigQuery (Serverless)

- 구글의 Dremel 기반의 **서버리스 데이터 웨어하우스**로, 내부적으로 수천 개의 슬롯(Slot) 이 MPP 방식으로 쿼리를 병렬 실행한다.

---

## 📚 요약 / 마무리

- **MPP(Massively Parallel Processing)** 는 **Shared-Nothing Architecture** 를 기반으로, 하나의 거대한 작업을 여러 노드가 동시에 나누어 처리하는 **분산 컴퓨팅 아키텍처**이다.
- **Shared-Nothing Architecture**, **Data Distribution**, **Parallel Query Processing**, **Scalability** 와 같은 특성을 통해 대규모 데이터에 대한 압도적인 처리 성능을 구현한다.
- Apache Impala, Presto, Amazon Redshift, Snowflake, Google BigQuery 등 **분산 쿼리 엔진과 데이터 웨어하우스에 광범위하게 활용**된다.
`;export{n as default};
