# _FlashRead_

This will be a website provided to you by Stratton Inc.

## Company name

Stratton Inc.

A revolutionary, innovative company with its headquarters resided in Didlaukis dorms.

## Members

It is a group project of 4 members
- Julius Jauga `Team Lead` `Fullstack Developer`
- Edvinas Navickas `Fullstack Developer` `Quality Assurance`
- Aurelijus Lukšas `Fullstack Developer` `UI Designer`
- Rokas Baliutavičius `Fullstack Developer` `Color Theory Specialist`

## Planning

Planning and roadmap of the project is provided in the roadmap project of FlashRead.

## Setup

Dependencies: Docker
```
npm install
```
```
git clone https://github.com/JuliusJauga/FlashRead.git
cd FlashRead
docker compose up -d
```

### or

*Terminal 1*
```
cd Client
npm run dev
```
#### For Windows
*Terminal 2*
```
cd server/server
$env:DB_PASSWORD="(DB_PASSWORD)"
$env:JWT_SECRET="(JWT_SECRET)"
dotnet run
```
#### For Linux
```
cd server/server
export DB_PASSWORD=(DB_PASSWORD)
export JWT_SECRET=(JWT_SECRET)
```


Web: http://localhost:5173/

## Use case diagram
![Use case diagram](res/use_case_diagram.png)

### Unit test setup

#### Backend
```
cd server/server.Tests
dotnet test
```
#### Frontend
```
cd Client
npm run lint
npm run test
```

<!-- LINKS & IMAGES>
