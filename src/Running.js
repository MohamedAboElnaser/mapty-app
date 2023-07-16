import { Workout } from './Workout.js';

//this class will be used to creat objects that will save the data for Running workout
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    //
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

export { Running };
