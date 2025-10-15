// TODO:
export class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  getInfo() {
    return `Name: ${this.name}, Email: ${this.email}`;
  }
}
