## 데이터 스키마
### 유저
```json
{
  "users": [
    {
      "id": "XSfIiNUnHGo",
      "nickname": "nickname",
      "username": "username",
      "password": "password"
    }
  ]
}
```
### 카테고리
```json
{
  "categories": [
    {
      "id": "tzwSI3hbWfY",
      "type": "income",
      "name": "월급"
    },
    {
      "id": "djfw3IvhfWy",
      "type": "expense",
      "name": "식비"
    }
  ]
}
```

### 모임
```json
{
  "groups": [
    {
      "id": "UbbWrW3NB2A",
      "userId": "XSfIiNUnHGo",
      "name": "단체 모임",
      "password": "group_password"
    }
  ]
}
```

### 모임 맴버
```json
{
  "groupMembers": [
    {
      "id": "XHX1W2qId0g",
      "groupId": "UbbWrW3NB2A",
      "userId": "XSfIiNUnHGo"
    }
  ]
}
```

### 수입/지출
```json
{
  "records": [
    {
      "id": "LxaJuMWGId4",
      "userId": "XSfIiNUnHGo",
      "type": "outcome",
      "groupId": null,
      "title": "점심식사",
      "memo": "메모",
      "categoryId": "djfw3IvhfWy",
      "amount": 10000,
      "date": "YYYY-MM-DD HH:mm:ss"
    }
  ]
}
```