## Table of Contents

- [Introduction](#introduction)
- [Folder_Structure](#folder_structure)
- [Installation](#installation)
- [Usage](#usage)
- [Functions](#functions)
  - [create_blog](#create_blog)
  - [like](#like)
  - [unlike](#unlike)
- [Contract_Address](#contract_address)
- [Links](#links)

## Introduction

This is a Blog app built on top of Aptos blockchain using move language. This project is part of Rise in bootcamp.

## Folder_Structure

Frontend - risein-aptos-bootcamp/frontend
Contract - risein-aptos-bootcamp/move

## Installation

To install and set up the project, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/ajaythxkur/risein-aptos-bootcamp
    ```

2. Navigate to the project directory:
    ```sh
    cd risein-aptos-bootcamp/frontend
    ```

3. Install the dependencies:
    ```sh
    npm install
    ```

## Usage

Run the project on development server:

```sh
npm run dev
```

## Functions

### `create_blog`

The `create_blog` function lets a user to create blog post in the application.

### `like`

The `like` function allows user like a blog post.

### `unlike`

The `unlike` function allows user to unlike the liked blog post.

### `donate`

The `donate` function allows user to donate aptos or any coin to the blog post author.

## Contract_Address

TESTNET - 0x85a20c0f2f67f8feff4368cc4c7217bf2b8984fedc90fd7a176af200d6855ff5

## Links

[Run functions through explorer](https://explorer.aptoslabs.com/account/0x85a20c0f2f67f8feff4368cc4c7217bf2b8984fedc90fd7a176af200d6855ff5/modules/run/blogs?network=testnet)