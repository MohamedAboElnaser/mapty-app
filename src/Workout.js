class Workout {
  id = (Date.now() + '').slice(-10);
  date = new Date();

  constructor(coords, distance, duration) {
    this.coords = coords; //[latitude ,longitude]
    this.distance = distance; // distance in km
    this.duration = duration; // duration in min
  }

  _setDescription() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.discription = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

export { Workout };
