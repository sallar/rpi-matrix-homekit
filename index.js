const fetch = require("node-fetch");

const API = "http://localhost:8000/";
let Service, Characteristic;

class RpiMatrix {
  getBusScheduleState(next) {
    fetch(`${API}/currentView`)
      .then(res => res.json())
      .then(({ viewName }) => {
        next(null, viewName === "bus");
      })
      .catch(err => {
        this.log(err);
        next(err);
      });
  }

  setBusScheduleState(on, next) {
    this.log("SETTING on", on);
    fetch(`${API}/setView`, {
      method: "POST",
      body: {
        viewName: "bus"
      }
    })
      .then(() => {
        next();
      })
      .catch(err => {
        this.log(err);
        next(err);
      });
  }

  getServices() {
    let informationService = new Service.AccessoryInformation();
    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Sallar Kaboli")
      .setCharacteristic(Characteristic.Model, "Rpi Matrix v1")
      .setCharacteristic(Characteristic.SerialNumber, "123-456-789");

    let busScheduleService = new Service.Switch("Bus Schedule");
    busScheduleService
      .getCharacteristic(Characteristic.On)
      .on("get", this.getBusScheduleState.bind(this))
      .on("set", this.setBusScheduleState.bind(this));

    this.informationService = informationService;
    this.busScheduleService = busScheduleService;
    return [informationService, busScheduleService];
  }
}

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory(
    "rpi-matrix-plugin",
    "RpiMatrix",
    new RpiMatrix()
  );
};
