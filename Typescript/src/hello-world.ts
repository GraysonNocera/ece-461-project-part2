export function hello(): string {
    console.log(process.env.GITHUB_TOKEN)
    return 'Hello, World!'
  }

  hello();