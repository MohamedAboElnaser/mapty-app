import { Running } from './Running.js';
import { Cycling } from './Cycling.js';

// the main logic for the app
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const resetBtn = document.querySelector('.resetButton');

class App {
  #map;
  #mapEvent;
  #workout = [];
  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    this._getLocalStorage();
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Can not read your location!!');
        }
      );
  }

  _loadMap(position) {
    let { latitude, longitude } = position.coords;
    this.#map = L.map('map').setView([latitude, longitude], 6);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //   the initial location to the map
    L.marker([51.5, -0.09])
      .addTo(this.#map)
      .bindPopup('Welcome to Mapty App')
      .openPopup();

    // here we show the form
    this.#map.on('click', this._showForm.bind(this));

    this.#workout.forEach(work => this._renderWorkoutMarker(work));
  }

  _showForm(mapEv) {
    form.classList.remove('hidden');
    inputDistance.focus();
    this.#mapEvent = mapEv;
  }
  // clear input fields and hide the input
  _hideForm() {
    inputDistance.value =
      inputElevation.value =
      inputCadence.value =
      inputDuration.value =
        '';
    form.classList.add('hidden');
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    e.preventDefault();
    //helper functions
    const valideInputs = (...input) => input.every(ele => Number.isFinite(ele));

    const allPositives = (...input) => input.every(e => e > 0);

    //get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    //if workout==  running ,create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //check for the validaty

      if (
        !valideInputs(distance, duration, cadence) ||
        !allPositives(distance, duration, cadence)
      )
        return alert('Inputs must be positive numbers !');

      workout = new Running([lat, lng], distance, duration, cadence);
    }
    // if workout == cycling create cycling obj
    if (type === 'cycling') {
      const elevationGain = +inputElevation.value;

      //check for the validity
      if (
        !valideInputs(distance, duration, elevationGain) ||
        !allPositives(distance, duration)
      )
        return alert('Inputs must be positives !');
      workout = new Cycling([lat, lng], distance, duration, elevationGain);
    }
    // add the new obj to the workout array
    this.#workout.push(workout);
    // render workout as mark on map
    this._renderWorkoutMarker(workout);

    // render workout as a list
    this._renderWorkout(workout);
    // hide form + clean input fields
    this._hideForm();
    // add marker where we click the map

    //add workout to the localstorage
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          closeOnClick: false,
          autoClose: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.discription}`)
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id=${workout.id}>
    <h2 class="workout__title">${workout.discription}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
    `;

    if (workout.type === 'running')
      html += `
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>
      `;

    if (workout.type === 'cycling') {
      html += `
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>
      `;
    }

    form.insertAdjacentHTML('afterend', html);
  }
  _moveToPopup(event) {
    const workoutElement = event.target.closest('.workout');
    if (!workoutElement) return;

    let workout = this.#workout.find(wo => wo.id === workoutElement.dataset.id);

    this.#map.setView(workout.coords, 6, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workout));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    // guard clause if it is the first time to run the app
    if (!data) return;
    this.#workout = data;
    this.#workout.forEach(work => {
      this._renderWorkout(work);
    });
  }

  _clearLocalStorage() {
    localStorage.clear();
    location.reload();
  }
}
export { App, resetBtn };
