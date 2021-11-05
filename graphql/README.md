# Dgraph Test

Just a quick local instance to follow the dgraph tutorial with

## Tutorial Docs

https://dgraph.io/docs/graphql/todo-app-tutorial/todo-schema-design
https://dgraph.io/docs/graphql/schema/migration/

## Commands

```bash
make dgraph

make migrate

make graphiql
```

## Graphql Playground

open http://localhost:8081?url=http://localhost:8080/graphql

## Add data

Add base user with tasks

```graphql
mutation {
  addUser(
    input: [
      {
        username: "alice@dgraph.io"
        name: "Alice"
        tasks: [
          { title: "Avoid touching your face", completed: false }
          { title: "Stay safe", completed: false }
          { title: "Avoid crowd", completed: true }
          { title: "Wash your hands often", completed: true }
        ]
      }
    ]
  ) {
    user {
      username
      name
      tasks {
        id
        title
        subtasks {
          id
          title
        }
      }
    }
  }
}
```

Add subtasks to a specific task

```graphql
mutation {
  updateTask(
    input: {
      filter: { id: "0x3" }
      set: {
        subtasks: [{ title: "test nested self referencing", user: { username: "alice@dgraph.io" } }]
      }
    }
  ) {
    numUids
  }
}
```

## Query data

```graphql
{
  getTask(id: "0x3") {
    id
    title
    completed
    user {
      username
      name
    }
    subtasks {
      id
      title
      user {
        username
        name
      }
    }
  }
}
```

## Cleanup

Remove all resources

```bash
make cleanup
```
