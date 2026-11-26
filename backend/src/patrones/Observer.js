class Subject {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  notify(event, payload) {
    this.observers.forEach((observer) => observer(event, payload));
  }
}

module.exports = Subject;
