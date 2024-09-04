import React, { useState, useEffect, useRef } from 'react';
import ReactTextTransition, { presets } from 'react-text-transition';
import './App.css';
import { getDistance } from 'geolib';

import currentMarkerImage from './img/current-marker.png';
import selectedMarkerImage from './img/selected-marker.png';

import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Define custom panes
const SetupPanes = () => {
  const map = useMap();

  useEffect(() => {
    // Create custom panes with different z-index
    map.createPane('discoveredPane').style.zIndex = "250";
    map.createPane('visitedPane').style.zIndex = "280";
    map.createPane('suggestedPane').style.zIndex = "300";
  }, [map]);

  return null;
};
// Иконка для маркера
const currentMarkerIcon = new L.Icon({
  iconUrl: currentMarkerImage,
  iconSize: [40, 40],
  iconAnchor: [6, 40],
});
// Иконка для маркера
const selectedMarkerIcon = new L.Icon({
  iconUrl: selectedMarkerImage,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Создание кастомных иконок на основе стиля маркера
const createMarkerIcon = (type: string, discovered: boolean) => {
  const size = L.point(30, 30);
  const anchor = L.point(size.x / 2+5, size.y / 2+5);

  if (discovered===false) {
      return L.divIcon({ className: "marker-icon marker-icon-question", html: '<i class="bi bi-question-circle-fill"></i>',iconSize: size,iconAnchor: anchor });
  }

  switch (type) {
    case "diamond":
      return L.divIcon({ className: "marker-icon marker-icon-diamond", html: '<i class="bi bi-gem"></i>',iconSize: size,iconAnchor: anchor });
    case "topaz":
      return L.divIcon({ className: "marker-icon marker-icon-topaz", html: '<i class="bi bi-diamond-fill"></i>',iconSize: size,iconAnchor: anchor });
    case "emerald":
      return L.divIcon({ className: "marker-icon marker-icon-emerald", html: '<i class="bi bi-suit-diamond-fill"></i>',iconSize: size,iconAnchor: anchor });
    case "ruby":
      return L.divIcon({ className: "marker-icon marker-icon-ruby", html: '<i class="bi bi-x-diamond-fill"></i>',iconSize: size,iconAnchor: anchor });
    case "bandit":
      return L.divIcon({ className: "marker-icon marker-icon-bandit", html: '<i class="bi bi-person-fill-x"></i>',iconSize: size,iconAnchor: anchor });
    case "empty":
      return L.divIcon({ className: "marker-icon marker-icon-checked", html: '<i class="bi bi-check-all"></i>',iconSize: size,iconAnchor: anchor });
    case "home":
      return L.divIcon({ className: "marker-icon marker-icon-checked", html: '<i class="bi bi-house-fill"></i>',iconSize: size,iconAnchor: anchor });
    default:
      return L.divIcon({ className: "marker-icon marker-icon-checked", html: '<i class="bi bi-check-all"></i>',iconSize: size,iconAnchor: anchor })
  }
};


// Опции для стилизации линий
const polylineOptions = {
  color: "black",
  opacity: 0.3,
  weight: 4,
  dashArray: "5, 20",
  dashOffset: "0",
};


function App() {

  const [gameStatus, setGameStatus] = useState<string>("loading");
  // const [gameUserName, setGameUserName] = useState<string>("");

  // const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const inputValue = event.target.value;
  //   if (inputValue.length <= 6) {setGameUserName(inputValue);}
  // };
  const gameStart = () => {
    console.log("gameStart")
    if (!(markers && markers["icao_connections"] && currentAirport["position"])) return;
    setGameStatus("game")
  };

  const [markers, setMarkers] = useState<{ [key: string]: any }>(
{'data': [
{'ICAO': 'AL-LA10', 'position': [40.085383, 20.15389], 'name': 'Gjirokastër Airfield', 'type': 'empty', 'discovered': false, 'iso_country': 'AL', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Albania'},
{'ICAO': 'AM-0001', 'position': [39.202272, 46.455204], 'name': 'Syunik Airport', 'type': 'empty', 'discovered': false, 'iso_country': 'AM', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Armenia'},
{'ICAO': 'AT-0009', 'position': [48.657837, 16.540234], 'name': 'Ameis Airstrip', 'type': 'topaz', 'discovered': false, 'iso_country': 'AT', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Austria'},
{'ICAO': 'AZ-0001', 'position': [40.4955422161, 49.9768066406], 'name': 'Zabrat Airport', 'type': 'bandit', 'discovered': false, 'iso_country': 'AZ', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Azerbaijan'},
{'ICAO': 'BA-0001', 'position': [44.438152313232, 18.685613632202], 'name': 'Sport airfield Ciljuge', 'type': 'bandit', 'discovered': false, 'iso_country': 'BA', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Bosnia_and'},
{'ICAO': 'EBAM', 'position': [50.740101, 3.4849], 'name': 'Amougies Airfield', 'type': 'empty', 'discovered': false, 'iso_country': 'BE', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Belgium'},
{'ICAO': 'BG-0003', 'position': [42.414635, 27.294455], 'name': 'Trustikovo Airstrip', 'type': 'empty', 'discovered': false, 'iso_country': 'BG', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Bulgaria'},
{'ICAO': 'BY-0001', 'position': [54.439999, 30.2967], 'name': 'Orsha Airport - Balbasovo Air Base', 'type': 'empty', 'discovered': false, 'iso_country': 'BY', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Belarus'},
{'ICAO': 'CH-0002', 'position': [46.12338, 7.23425], 'name': 'Altiport de Croix de Coeur', 'type': 'empty', 'discovered': false, 'iso_country': 'CH', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Switzerlan'},
{'ICAO': 'CY-0001', 'position': [35.106384, 33.321304], 'name': 'Lakatamia Airfield', 'type': 'empty', 'discovered': false, 'iso_country': 'CY', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Cyprus'},
{'ICAO': 'CZ-0048', 'position': [50.2108813, 14.6574049], 'name': 'Borek', 'type': 'ruby', 'discovered': false, 'iso_country': 'CZ', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Czech_Repu'},
{'ICAO': 'DE-0003', 'position': [49.853757, 8.586243], 'name': 'August-Euler Flugplatz', 'type': 'topaz', 'discovered': false, 'iso_country': 'DE', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Germany'},
{'ICAO': 'DK-0001', 'position': [54.984115, 11.537662], 'name': 'Femø Airfield', 'type': 'emerald', 'discovered': false, 'iso_country': 'DK', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Denmark'},
{'ICAO': 'EE-9278', 'position': [59.53670120239258, 26.31170082092285], 'name': 'Kunda Air Base', 'type': 'empty', 'discovered': false, 'iso_country': 'EE', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Estonia'},
{'ICAO': 'ES-0001', 'position': [36.858888888900005, -6.13916666667], 'name': 'Trebujena Airfield', 'type': 'empty', 'discovered': false, 'iso_country': 'ES', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Spain'},
{'ICAO': 'EFAA', 'position': [67.60359954833984, 23.97170066833496], 'name': 'Aavahelukka Airport', 'type': 'empty', 'discovered': false, 'iso_country': 'FI', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Finland'},
{'ICAO': 'FR-0009', 'position': [44.601293, 3.927773], 'name': 'Altisurface Notre-Dame-des-Neiges-Abbaye', 'type': 'empty', 'discovered': false, 'iso_country': 'FR', 'wikipedia_link': 'https://en.wikipedia.org/wiki/France'},
{'ICAO': 'Cark', 'position': [54.163753, -2.962299], 'name': 'Cark airfield', 'type': 'empty', 'discovered': false, 'iso_country': 'GB', 'wikipedia_link': 'https://en.wikipedia.org/wiki/United_Kin'},
{'ICAO': 'GE-0006', 'position': [41.840599, 41.799461], 'name': 'Kobuleti Airfield', 'type': 'empty', 'discovered': false, 'iso_country': 'GE', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Georgia_(c'},
{'ICAO': 'GR-0001', 'position': [40.8409569, 21.826057], 'name': 'Arnissa Airport', 'type': 'emerald', 'discovered': false, 'iso_country': 'GR', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Greece'},
{'ICAO': 'HR-0001', 'position': [45.585, 17.211389], 'name': 'Daruvar', 'type': 'ruby', 'discovered': false, 'iso_country': 'HR', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Croatia'},
{'ICAO': 'HU-0001', 'position': [46.803936, 20.527838], 'name': 'Kákahalom Airfield', 'type': 'home', 'discovered': false, 'iso_country': 'HU', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Hungary'},
{'ICAO': 'EIAB', 'position': [53.59170150756836, -7.645559787750244], 'name': 'Abbeyshrule Aerodrome', 'type': 'empty', 'discovered': false, 'iso_country': 'IE', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Ireland'},
{'ICAO': 'IT-0001', 'position': [45.268665, 7.947943], 'name': 'Aviosuperficie Il Falco', 'type': 'empty', 'discovered': false, 'iso_country': 'IT', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Italy'},
{'ICAO': 'EYAL', 'position': [54.412525, 24.059929], 'name': 'Alytus Airfield', 'type': 'empty', 'discovered': false, 'iso_country': 'LT', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Lithuania'},
{'ICAO': 'ELLX', 'position': [49.6233333, 6.2044444], 'name': 'Luxembourg-Findel International Airport', 'type': 'diamond', 'discovered': false, 'iso_country': 'LU', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Luxembourg'},
{'ICAO': 'EVAD', 'position': [57.098598, 24.2658], 'name': 'Adazi Airfield', 'type': 'empty', 'discovered': false, 'iso_country': 'LV', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Latvia'},
{'ICAO': 'LUBL', 'position': [47.843056, 27.777222], 'name': 'B?l?i International Airport', 'type': 'empty', 'discovered': false, 'iso_country': 'MD', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Moldova'},
{'ICAO': 'LYBR', 'position': [42.8390007019043, 19.86199951171875], 'name': 'Berane Airport', 'type': 'empty', 'discovered': false, 'iso_country': 'ME', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Montenegro'},
{'ICAO': 'LW66', 'position': [41.333099, 21.4491], 'name': 'Malo Konjari Sport Airfield', 'type': 'empty', 'discovered': false, 'iso_country': 'MK', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Macedonia'},
{'ICAO': 'LMML', 'position': [35.857498, 14.4775], 'name': 'Malta International Airport', 'type': 'empty', 'discovered': false, 'iso_country': 'MT', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Malta'},
{'ICAO': 'EHAL', 'position': [53.453612, 5.678396], 'name': 'Ameland Airfield', 'type': 'topaz', 'discovered': false, 'iso_country': 'NL', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Netherland'},
{'ICAO': 'ENAE', 'position': [61.257401, 11.6689], 'name': 'Æra Airfield', 'type': 'bandit', 'discovered': false, 'iso_country': 'NO', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Norway'},
{'ICAO': 'EPAR', 'position': [49.657501, 22.514298], 'name': 'Ar?amów Airport', 'type': 'empty', 'discovered': false, 'iso_country': 'PL', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Poland'},
{'ICAO': 'ES-0025', 'position': [38.077502, -8.235832], 'name': 'Aerodromo de Figueira dos Cavaleiros', 'type': 'empty', 'discovered': false, 'iso_country': 'PT', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Portugal'},
{'ICAO': 'LR79', 'position': [45.158699, 27.430901], 'name': 'Ianca Air Base', 'type': 'empty', 'discovered': false, 'iso_country': 'RO', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Romania'},
{'ICAO': 'LY87', 'position': [44.7743, 20.9613], 'name': 'Kovin Airstrip', 'type': 'empty', 'discovered': false, 'iso_country': 'RS', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Serbia'},
{'ICAO': 'UUWW', 'position': [55.5914993286, 37.2615013123], 'name': 'Vnukovo International Airport', 'type': 'empty', 'discovered': false, 'iso_country': 'RU', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Russia'},
{'ICAO': 'ESCF', 'position': [58.40230178833008, 15.525699615478516], 'name': 'Malmen Air Base', 'type': 'empty', 'discovered': false, 'iso_country': 'SE', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Sweden'},
{'ICAO': 'LJAJ', 'position': [45.889198, 13.8869], 'name': 'Ajdovš?ina Airfield', 'type': 'empty', 'discovered': false, 'iso_country': 'SI', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Slovenia'},
{'ICAO': 'CZ-0052', 'position': [48.5992279, 21.1598857], 'name': 'Letisko Ve?ká Ida', 'type': 'empty', 'discovered': false, 'iso_country': 'SK', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Slovakia'},
{'ICAO': 'LIKD', 'position': [43.948895, 12.511411], 'name': 'Torraccia Airfield', 'type': 'empty', 'discovered': false, 'iso_country': 'SM', 'wikipedia_link': 'https://en.wikipedia.org/wiki/San_Marino'},
{'ICAO': 'LT86', 'position': [40.204498, 25.883302], 'name': 'Gökçeada Airport', 'type': 'empty', 'discovered': false, 'iso_country': 'TR', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Turkey'},
{'ICAO': 'BY-0011', 'position': [50.3771921, 23.9648804], 'name': 'Aerodrom Belz', 'type': 'topaz', 'discovered': false, 'iso_country': 'UA', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Ukraine'},
{'ICAO': 'BKPR', 'position': [42.5728, 21.035801], 'name': 'Priština Adem Jashari International Airp', 'type': 'emerald', 'discovered': false, 'iso_country': 'XK', 'wikipedia_link': 'https://en.wikipedia.org/wiki/Kosovo'}],
  'icao_connections': [['AL-LA10', 'EBAM', 1754]

  ]}

  );

  const [currentMoney, setCurrentMoney] = useState<string>("12000");
  const [currentFuel, setCurrentFuel] = useState<string>("12000");

  const [currentAirport, setCurrentAirport] = useState<{ [key: string]: any }>({});
  // const [selectedAirport, setSelectedAirport] = useState<{ [key: string]: any }>({'ICAO': "choose_airport", 'position': [0, 0], 'name': 'Choose Airport', 'type': 'question'});
  const [selectedAirport, setSelectedAirport] = useState<{ [key: string]: any }>({});


  const [diamondFound,   setDiamondFound] = useState<boolean>(false);


  // =================================================================
  // Генериция игры
    useEffect(() => {

    // Выбор случайных 20 городов
    const shuffledCities = [...markers.data].sort(() => 0.5 - Math.random());
    const selectedCities = shuffledCities.slice(0, 20);
    // console.log(selectedCities);

    // Распределение типов
    const lootboxTypes: { [key: string]: number } = {
      "topaz": 4,
      "emerald": 3,
      "ruby": 2,
      "bandit": 3,
      "diamond": 1,
      "home": 1
    };

    const updatedCities = selectedCities.map((city, index) => {
      for (const [type, count] of Object.entries(lootboxTypes)) {
        if (count > 0) {
          lootboxTypes[type] -= 1;
          return { ...city, type: type };
        }
      }
      return city; // Остальные города остаются с типом "empty"
    });
    // console.log("updatedCities",updatedCities);

    // Генерация уникальных соединений
    const connections: [string, string, number][] = [];
    const cityConnections: { [key: string]: number } = {}; // Для отслеживания числа соединений каждого города

    const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    for (let i = 0; i < updatedCities.length; i++) {
      const city1 = updatedCities[i];
      cityConnections[city1.ICAO] = cityConnections[city1.ICAO] || 0;

      // Генерация от 2 до 5 соединений для каждого города
      const connectionsToCreate = getRandomInt(2, 5);

      for (let j = i + 1; j < updatedCities.length && cityConnections[city1.ICAO] < connectionsToCreate; j++) {
        const city2 = updatedCities[j];
        cityConnections[city2.ICAO] = cityConnections[city2.ICAO] || 0;

        // Проверяем, чтобы город 2 не превысил 4 соединений
        if (cityConnections[city2.ICAO] < 5) {
          // Рассчитываем расстояние и округляем до целого числа
          const distance = Math.round(
            getDistance(
              { latitude: city1.position[0], longitude: city1.position[1] },
              { latitude: city2.position[0], longitude: city2.position[1] }
            ) / 1000
          );

          // Добавляем соединение в массив
          connections.push([city1.ICAO, city2.ICAO, distance]);
          cityConnections[city1.ICAO]++;
          cityConnections[city2.ICAO]++;
        }
      }
    }
    // console.log("connections",connections);
    // console.log("cityConnections",cityConnections);


    // Обновляем состояние с новыми значениями типов и соединениями
    setMarkers(prevState => ({
      ...prevState,
      data: updatedCities,
      icao_connections: connections
    }));

    setCurrentAirport(updatedCities.find((airport:any) => airport.type === "home"))


  }, []);

  // =================================================================



  // =================================================================
  // Проверка на телефон
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor ;

    // Проверка на мобильные устройства
    const isMobile = /android|iphone|ipad|ipod|windows phone|blackberry|mobile/i.test(userAgent);

    setIsDesktop(!isMobile && window.innerWidth > 768);
  }, []);
  // =================================================================



  // =================================================================
  // Расчёт всех путей
  const [visitedAirports,   setVisitedAirports] = useState<string[]>([]);

  const [visitedPaths,   setVisitedPaths] = useState<[number, number][][]>([]);
  const [discoveredPaths,   setDiscoveredPaths] = useState<[number, number][][]>([]);
  const [suggestedPaths, setSuggestedPaths] = useState<[number, number][][]>([]);
  const generatePaths = (
    data: any,
    currentAirport: any,
    selectedAirport: any,
    icaoConnections: [string, string][],
    visitedAirports: string[],
    visitedPaths: [number, number][][],
    discoveredPaths: [number, number][][],
  ) => {

    // Найти пути для текущего аэропорта
    const currentAirportPaths = icaoConnections
      .filter(
        (conn) => conn.includes(currentAirport.ICAO)
      )
      .map((conn) => {
        const otherICAO = conn[0] === currentAirport.ICAO ? conn[1] : conn[0];
        const airport1 = data.find((airport: any) => airport.ICAO === currentAirport.ICAO);
        const airport2 = data.find((airport: any) => airport.ICAO === otherICAO);

        return airport1 && airport2 ? [airport1.position, airport2.position] : null;
      })
      .filter(Boolean) as [number, number][][];

    // Обновляем suggestedPaths
    // const newSuggestedPaths = currentAirportPaths.filter(
    //   (path) => !visitedPaths.includes(path) && !discoveredPaths.includes(path)
    // );



    // Обновляем discoveredPaths на основе visitedAirports
    let newDiscoveredPaths = visitedAirports.flatMap((visitedICAO) =>
      icaoConnections
        .filter((conn) => conn.includes(visitedICAO))
        .map((conn) => {
          const otherICAO = conn[0] === visitedICAO ? conn[1] : conn[0];
          const airport1 = data.find((airport: any) => airport.ICAO === visitedICAO);
          const airport2 = data.find((airport: any) => airport.ICAO === otherICAO);

          return airport1 && airport2 ? [airport1.position, airport2.position] : null;
        })
        .filter(Boolean) as [number, number][][]
    );

    // Уникальные пути в массиве (проблема дублирования путей)
    const uniquePaths = (paths: [number, number][][]) => {
      const pathStringSet = new Set<string>();

      return paths.filter(path => {
        const pathString = JSON.stringify(path);
        if (pathStringSet.has(pathString)) {
          return false;
        } else {
          pathStringSet.add(pathString);
          return true;
        }
      });
    };

    // console.log("visitedAirports:",visitedAirports)
    // console.log("visitedPaths:",visitedPaths)
    // console.log("discoveredPaths:",newDiscoveredPaths)
    // console.log("suggestedPaths:",currentAirportPaths)

    setSuggestedPaths(uniquePaths(currentAirportPaths));
    setDiscoveredPaths(uniquePaths(newDiscoveredPaths));
    // setDiscoveredPaths((newDiscoveredPaths));
  };

  useEffect(() => {
    markers && markers["data"] && markers["icao_connections"] &&
    generatePaths(
      markers["data"],
      currentAirport,
      selectedAirport,
      markers["icao_connections"],
      visitedAirports,
      visitedPaths,
      discoveredPaths
    );
  }, [currentAirport]);
  // =================================================================



  const fetchMarkers = async () => {
    try {
      const response = await fetch('http://localhost:4000/get_markers', {method: 'GET',mode: 'cors',headers: { 'Content-Type': 'application/json' },});
      if (!response.ok) {throw new Error(`Failed to fetch markers: ${response.statusText}`);}

      const data = await response.json();

      console.log(data);
      setMarkers(data);
      setCurrentAirport(data["data"].find((airport:any) => airport.type === "home"))


    } catch (error) {
      console.error('Failed to fetch markers:', error);
    }
  };

  useEffect(() => {
    // fetchMarkers();
  }, []);





  const handleMarkerClick = (airport: any) => {
    setSelectedAirport(airport);
    console.log("Selected Airport:", airport);
  };


  // =================================================================
  // Обработак ивента
  const [newEvent,   setNewEvent] = useState<boolean>(false);
  const [eventType,   setEventType] = useState<string>("");

  const handleOpenLootbox = (currencyType: string) => {
    if (eventType !== "") {return}

    // Проверка наличия денег или топлива
    if (currencyType === "money") {
      if (Number(currentMoney) < 100) {
        alert("Not enough money to proceed.");
        return;
      }
      // Уменьшаем деньги
      setCurrentMoney((prev) => (Number(prev) - 100).toString());
    } else if (currencyType === "fuel") {
      if (Number(currentFuel) < 50) {
        alert("Not enough fuel to proceed.");
        return;
      }
      // Уменьшаем топливо
      setCurrentFuel((prev) => (Number(prev) - 50).toString());
    }

    // Обновляем тип события
    setEventType(currentAirport["type"]);

    // Обновляем markers
    setMarkers((prevMarkers) => {
      // Создаем новую версию массива markers
      const updatedMarkers = { ...prevMarkers };

      // Обновляем соответствующий аэропорт в массиве data
      updatedMarkers["data"] = updatedMarkers["data"].map((airport:any) => {
        if (airport.ICAO === currentAirport.ICAO) {
          return { ...airport, discovered: true };
        }
        return airport;
      });

      return updatedMarkers;
    });

    // setDiscoveredAirports((prevAirports) => [
    //   ...new Set([...prevAirports, currentAirport.ICAO]),
    // ]);

    // setTimeout(() => {}, 1500);

    // Логика для изменения состояния в зависимости от типа аэропорта
    switch (currentAirport["type"]) {
      case "topaz":
        setCurrentMoney((prev) => (Number(prev) + 300).toString());
        break;
      case "emerald":
        setCurrentMoney((prev) => (Number(prev) + 600).toString());
        break;
      case "ruby":
        setCurrentMoney((prev) => (Number(prev) + 1000).toString());
        break;
      case "bandit":
        setCurrentMoney("0");
        break;
      case "diamond":
        setDiamondFound(true);
        break;
      default:
        break;
    }
  };
  // =================================================================



  // =================================================================
  // Обменник
  const [exchangeMoney, setExchangeMoney] = useState<string>("0");
  const [exchangeFuel, setExchangeFuel] = useState<string>("0");
  const handleExcangeMoneyInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // Проверяем, что вводимая строка является целым числом и меньше либо равна currentMoney
    if (/^\d*$/.test(value) && Number(value) <= Number(currentMoney)) {
      setExchangeMoney(value);
      setExchangeFuel((Number(value)*2).toString());
    }
  };
  const handleExcangeFuelInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // Проверяем, что вводимая строка является целым числом и меньше либо равна currentMoney
    if (/^\d*$/.test(value) && Number(value) <= Number(currentMoney)*2 && Number(value) % 2 == 0) {
      setExchangeMoney((Number(value)/2).toString());
      setExchangeFuel(value);
    }
  };

  const [isExchangeHolding, setIsExchangeHolding] = useState(false);
  const timerRefExchangeHolding = useRef<NodeJS.Timeout | null>(null);

  const handleExchangeMouseDown = () => {
    if (exchangeMoney.length == 0 || exchangeMoney==="0") return
    setIsExchangeHolding(true);

    timerRefExchangeHolding.current = setTimeout(() => {
      console.log('Button held for 3 seconds! Action triggered.');
      setIsExchangeHolding(false);
      setExchangeMoney("");
      setExchangeFuel("");

      setCurrentMoney((Number(currentMoney)-Number(exchangeMoney)).toString());
      setCurrentFuel((Number(currentFuel)+Number(exchangeFuel)).toString())
      // Здесь можно вызвать любую функцию по завершении 3 секунд удерживания
    }, 1500);
  };

  const handleExchangeMouseUp = () => {
    setIsExchangeHolding(false);
    if (timerRefExchangeHolding.current) {
      clearTimeout(timerRefExchangeHolding.current);
      timerRefExchangeHolding.current = null; // Сбрасываем таймер
    }
  };
  // =================================================================


  // =================================================================
  // Расчёт расстояния да аэропорта
  // const [expectedDistance, setExpectedDistance] = useState<string>("0");

  const findConnectionDistance = (
    aAirportICAO: string,
    bAirportICAO: string,
  ): string => {
    if (!markers["icao_connections"]) return "0"
    // Найти соединение между текущим и выбранным аэропортом
    const connection = markers["icao_connections"].find(
      (conn: any) =>
        (conn[0] === aAirportICAO && conn[1] === bAirportICAO) ||
        (conn[0] === bAirportICAO && conn[1] === aAirportICAO)
    );

    // Вернуть расстояние или "0", если соединение не найдено
    return connection ? connection[2].toString() : "0";
  };
  // useEffect(() => {
  //   setExpectedDistance(findConnectionDistance(selectedAirport.ICAO,currentAirport.ICAO))
  // }, [selectedAirport]);
  // =================================================================


  // =================================================================
  // Обработка перелёта

  const [isFlightHolding, setIsFlightHolding] = useState(false);
  const timerRefFlightHolding = useRef<NodeJS.Timeout | null>(null);

  const handleFlightMouseDown = () => {

    if (selectedAirport.ICAO && currentAirport.ICAO) {
      // Найти расстояние между текущим и выбранным аэропортом
      const connection = markers.icao_connections.find(
        (conn: any) =>
          (conn[0] === currentAirport.ICAO && conn[1] === selectedAirport.ICAO) ||
          (conn[0] === selectedAirport.ICAO && conn[1] === currentAirport.ICAO)
      );

      if (!connection) {return}
    }
    if (Number(findConnectionDistance(currentAirport.ICAO,selectedAirport.ICAO)) > Number(currentFuel)) return

    setIsFlightHolding(true);

    timerRefFlightHolding.current = setTimeout(() => {
      console.log('Button held for 3 seconds! Action triggered.');

      const newVisitedPath = markers["data"]
        .filter((airport: any) =>
          [currentAirport.ICAO, selectedAirport.ICAO].includes(airport.ICAO)
        )
        .map((airport: any) => airport.position) as [number, number][];

      setVisitedPaths((prevPaths) => [...prevPaths, newVisitedPath]);
      // setVisitedAirports((prevAirports) => [
      //   ...new Set([...prevAirports, currentAirport.ICAO, selectedAirport.ICAO]),
      // ]);

      const new_distance:string = findConnectionDistance(currentAirport.ICAO,selectedAirport.ICAO);
      setCurrentFuel((Number(currentFuel)-Number(new_distance)).toString())

      setIsFlightHolding(false);
      setCurrentAirport(selectedAirport);
      setSelectedAirport({});
      setEventType("");
      // Здесь можно вызвать любую функцию по завершении 2 секунд удерживания
    }, 2000);
  };

  const handleFlightMouseUp = () => {
    setIsFlightHolding(false);
    if (timerRefFlightHolding.current) {
      clearTimeout(timerRefFlightHolding.current);
      timerRefFlightHolding.current = null;
    }
  };
  // =================================================================


  // =================================================================
  // Новый город

  useEffect(() => {
    if (!currentAirport || !currentAirport.ICAO) return;


    if (currentAirport["discovered"] === false && currentAirport["type"] !== "empty" && currentAirport["type"] !== "home") {
      setNewEvent(true);
    }
    else {setNewEvent(false);}

    if (currentAirport["type"] === "empty" || currentAirport["type"] === "home") {

      // Обновляем markers
      setMarkers((prevMarkers) => {
        // Создаем новую версию массива markers
        const updatedMarkers = { ...prevMarkers };

        // Обновляем соответствующий аэропорт в массиве data
        updatedMarkers["data"] = updatedMarkers["data"].map((airport:any) => {
          if (airport.ICAO === currentAirport.ICAO) {
            return { ...airport, discovered: true };
          }
          return airport;
        });

        return updatedMarkers;
      });
    }

    setVisitedAirports((prevAirports) => [
      ...new Set([...prevAirports, currentAirport.ICAO]),
    ]);

    // Проверка победы
    if (diamondFound && currentAirport["type"] === "home") {
      setGameStatus("win");
    }

  }, [currentAirport]);
  // =================================================================







  // =================================================================
  // Синхронизация данных
  // useEffect(() => {
  //   const updateGameManager = async () => {
  //     try {
  //       const response = await fetch('http://localhost:4000/update_game_manager', {
  //         method: 'POST',
  //         mode: 'cors',
  //         headers: {
  //           'Content-Type': 'application/json'
  //         },
  //         body: JSON.stringify({
  //           game_status: gameStatus,
  //           game_user_name: gameUserName,
  //           current_money: currentMoney,
  //           current_fuel: currentFuel,
  //           currentAirport: currentAirport,
  //           visitedAirports: visitedAirports,
  //           visitedPaths: visitedPaths,
  //           discoveredPaths: discoveredPaths,
  //           suggestedPaths: suggestedPaths,
  //           diamondFound: diamondFound
  //         })
  //       });
  //
  //       if (!response.ok) {
  //         throw new Error(`Failed to update game manager: ${response.statusText}`);
  //       }
  //
  //       const result = await response.json();
  //       console.log('Game manager updated:', result);
  //     } catch (error) {
  //       console.error('Error updating game manager:', error);
  //     }
  //   };
  //
  //   // Отправка данных при изменении зависимых переменных
  //   updateGameManager();
  // }, [currentAirport]);
  // // }, [gameStatus, currentMoney, currentFuel, currentAirport, visitedAirports, visitedPaths, discoveredPaths, suggestedPaths, diamondFound]);
  //
  // useEffect(() => {
  //   const updateGameMarkers = async () => {
  //     if (!markers || !markers.data || markers.data.length === 0) return;
  //     console.log("updateGameMarkers:",markers)
  //     try {
  //       const response = await fetch('http://localhost:4000/update_game_markers', {
  //         method: 'POST',
  //         mode: 'cors',
  //         headers: {
  //           'Content-Type': 'application/json'
  //         },
  //         body: JSON.stringify({
  //           markers: markers.data  // Отправка всего массива маркеров
  //         })
  //       });
  //
  //       if (!response.ok) {
  //         throw new Error(`Failed to update game markers: ${response.statusText}`);
  //       }
  //
  //       const result = await response.json();
  //       console.log('Game markers updated:', result);
  //     } catch (error) {
  //       console.error('Error updating game markers:', error);
  //     }
  //   };
  //
  //   updateGameMarkers();
  // }, [markers]);

  // =================================================================

  // Пример изменения денег через каждые 2 секунды
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentMoney((prev) => {
  //       const newValue = Number(prev) + Math.floor(Math.random() * 100 - 50);
  //       return newValue.toString();
  //     });
  //     setCurrentFuel((prev) => {
  //       const newValue = Number(prev) + Math.floor(Math.random() * 1000 - 50);
  //       return newValue.toString();
  //     });
  //     // setCurrentMoney((prev) => Number(prev) + Math.floor(Math.random() * 100 - 50));
  //   }, 2000);
  //
  //   return () => clearInterval(interval);
  // }, [currentMoney]);




  return (
    <div className="full_body">
      { gameStatus==="loading" && (
      <div className="loading_screen">
        {/*<div className="loading_screen_loader"></div>*/}
        <h2 style={{marginBottom:"10px", fontSize:"35px", color: "#69a4e8"}}>Afrikan Tähti</h2>
        {isDesktop && (<button className="loading_screen_start_button" onClick={()=>gameStart()}>Start</button>)}
        {!isDesktop && (<p style={{fontWeight:"600", fontSize:"20px", color:"#bebebe", textAlign:"center"}}>Sorry, phones are <br/>currently unsupported.<br/>😔</p>)}
        <a href="https://chebanik.alwaysdata.net/" style={{marginTop:"20px", fontWeight:"600", color:"#bebebe", fontFamily:"Rubik, sans-serif", textDecoration:"none"}}>Made by Ilia Chebanik</a>
      </div>)}

      {gameStatus!=="loading" && (<>
      <div className="header"><h2>Afrikan Tähti</h2></div>

      <div className={"game_container"}>
        {markers && markers["data"] && markers["icao_connections"] && currentAirport["position"] && (
        <div className={"map_container"}>

          {/*<MapContainer center={[38.505, -90.09]} zoom={3} style={{ width:"100%", height: "100%" }}>*/}
          <MapContainer center={currentAirport["position"]} zoom={3} style={{ width:"100%", height: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <SetupPanes />

            {discoveredPaths.map((path, index) => (
            <Polyline key={"discoveredPaths"+index} positions={path} pathOptions={{ ...polylineOptions, className: "discovered_path" }} pane="discoveredPane"  />
            ))}
            {visitedPaths.map((path, index) => (
            <Polyline key={"visitedPaths"+index} positions={path} pathOptions={{color: "green", weight: 4, opacity: 0.9 - ((0.5 / (visitedPaths.length - 1))* index), className: "visited_path"}} pane="visitedPane"/>
            ))}
            {suggestedPaths.map((path, index) => (
            <Polyline key={"sugP"+index} positions={path} pathOptions={{weight: 5, className: "pulsing_path"}} pane="suggestedPane" />
            ))}

            {markers["data"].map((marker:any) => (
              <Marker key={marker.ICAO} position={marker.position} icon={createMarkerIcon(marker["type"], marker["discovered"])}
                eventHandlers={{click: () => handleMarkerClick(marker),}}>
                <Tooltip>{marker.name} {findConnectionDistance(marker.ICAO,currentAirport.ICAO) !== "0" ? `- ${findConnectionDistance(marker.ICAO,currentAirport.ICAO)} km` : ""}</Tooltip>
                {/*<Popup>*/}
                {/*  <div className="custom-popup">*/}
                {/*    {marker.name}*/}
                {/*  </div>*/}
                {/*</Popup>*/}
              </Marker>
            ))}


            {currentAirport && currentAirport["position"] && (
            <Marker key={"currentAirportMarkerIcon"} position={currentAirport["position"]} icon={currentMarkerIcon}>
              <Tooltip><div className="custom-popup">You are here</div></Tooltip>
            </Marker>
            )}
            {selectedAirport && selectedAirport["position"] && (
            <Marker key={"selectedAirportMarkerIcon"} position={selectedAirport["position"]} icon={selectedMarkerIcon}>

              <Tooltip><div className="custom-popup">Selected Airport {findConnectionDistance(selectedAirport.ICAO,currentAirport.ICAO) !== "0" ? `- ${findConnectionDistance(selectedAirport.ICAO,currentAirport.ICAO)} km` : ""}</div></Tooltip>
            </Marker>
            )}
          </MapContainer>
        </div>
        )}

        {gameStatus === "game" && (
        <div className={"control_container"}>
          <div className={"control_panel"}>
            <div className={"control_panel_header"}>Player Info<i className="bi bi-person-fill ml5"></i></div>
            <div className={"control_panel_content_row"}>
              <div className={"control_panel_content_column"} title={"Current Money"}>
                {currentMoney.split("").map((txt, i) => (
                  <ReactTextTransition key={"currentMoney"+i} delay={i * 100} className="big" inline>{txt}</ReactTextTransition>
                ))}
                <i className="bi bi-currency-exchange ml5" onClick={()=>setCurrentMoney((Number(currentMoney)+1000).toString())}></i></div>
              <div className={"control_panel_content_column"} title={"Current Fuel"}>
                {currentFuel.split("").map((txt, i) => (
                  <ReactTextTransition key={"currentFuel"+i} delay={i * 100} className="big" inline>{txt}</ReactTextTransition>
                ))}
                <i className="bi bi-fuel-pump-fill ml5"></i><p style={{marginLeft:"5px"}}>km</p>
              </div>
            </div>
            {/*<div className={"control_panel_content_row"}><div className={"control_panel_content_column"}>{currentAirport["name"]}</div></div>*/}
            <div className={"control_panel_content_row"}>
              <div className={"control_panel_content_column"}>
                <ReactTextTransition springConfig={presets.gentle} style={{minHeight:"50px", alignItems:"center"}}>{currentAirport["name"] || "Loading..."}</ReactTextTransition>
                <img className={"iso_country_flag"} onClick={()=>window.open(`https://en.wikipedia.org/wiki/ISO_3166-2:${currentAirport["iso_country"]}`, '_blank')} title={`https://en.wikipedia.org/wiki/ISO_3166-2:${currentAirport["iso_country"]}`}
                     src={`https://flagsapi.com/${currentAirport["iso_country"]}/flat/64.png`}  />
              </div>
            </div>
          </div>

          <div className={"control_panel"}>
            <div className={"control_panel_header"}>Money to Fuel <i className="bi bi-currency-exchange" style={{marginLeft:"10px"}}></i><i className="bi bi-arrow-right-short"></i><i className="bi bi-fuel-pump-fill"></i></div>
            <div className={"control_panel_content_row"}>

              <div className={"control_panel_content_column"}>
                <input
                  type="number" className={"exchange_money_input"}
                  value={exchangeMoney} onChange={handleExcangeMoneyInputChange}
                  min="0" max={currentMoney}
                  step="100" placeholder="0"
                />
                <i className="bi bi-currency-exchange ml5"></i>
                <div className={"max_value_button"} onClick={()=> {setExchangeMoney(currentMoney);setExchangeFuel((Number(currentMoney)*2).toString());}}>max</div>
              </div>
              <div className={"control_panel_content_column"} style={{width: "0"}}>
                <div onMouseDown={handleExchangeMouseDown} onMouseUp={handleExchangeMouseUp} onMouseLeave={handleExchangeMouseUp}
                     className={isExchangeHolding ? 'exchange_loader exchange_loader_holding' : 'exchange_loader'}>
                  <i className="bi bi-arrow-right-short exchange_arrow_icon"></i>
                </div>
              </div>
              <div className={"control_panel_content_column"}>
                <input
                  type="number" className={"exchange_money_input"}
                  value={exchangeFuel} onChange={handleExcangeFuelInputChange}
                  min="0" max={Number(currentMoney)*2}
                  step="100" placeholder="0"
                />
                <i className="bi bi-fuel-pump-fill ml5"></i>
                <div className={"max_value_button"} onClick={()=> {setExchangeMoney(currentMoney);setExchangeFuel((Number(currentMoney)*2).toString());}}>max</div>
              </div>
            </div>
          </div>


          {markers["icao_connections"] && currentAirport["ICAO"] && (
            <div className={"control_panel"}>
              <div className={"control_panel_header"}>Available Airports<i className="bi bi-buildings-fill" style={{marginLeft:"10px"}}></i></div>
              {markers["icao_connections"]
                .filter((icaoport:any) => icaoport.includes(currentAirport["ICAO"]))
                .sort((a:any, b:any) => a[2] - b[2])
                .map((port:any, index:number) => {
                  // Определяем другой аэропорт
                  const otherICAO = port[0] === currentAirport["ICAO"] ? port[1] : port[0];
                  const otherAirport = markers["data"].find((airport:any) => airport.ICAO === otherICAO);

                  // Если нашли другой аэропорт, отображаем его имя и расстояние
                  return (
                    otherAirport && (<>
                      <div key={index} className={"control_panel_content_row airport_row_with_hover"} style={{backgroundColor: (selectedAirport === otherAirport) ? "#cccccc4d":""}}
                           onClick={()=>handleMarkerClick(otherAirport)}>
                        <div className={"control_panel_content_column"}>
                          <ReactTextTransition springConfig={presets.gentle} style={{minHeight:"50px", alignItems:"center"}}>{otherAirport.name}</ReactTextTransition>
                        </div>
                        <div className={"control_panel_content_column"} style={{width:"150px"}}>
                          <ReactTextTransition springConfig={presets.gentle}>{port[2] !== "0" ? port[2] : "???"}</ReactTextTransition>
                          <i className="bi bi-fuel-pump-fill ml5"></i><p className={"ml5"}>km</p>
                        </div>
                      </div>
                      {findConnectionDistance(selectedAirport.ICAO,currentAirport.ICAO) !== "0" && (selectedAirport === otherAirport) && (
                      <div className={"control_panel_content_row"} style={{cursor: "pointer"}}
                           onMouseDown={handleFlightMouseDown} onMouseUp={handleFlightMouseUp} onMouseLeave={handleFlightMouseUp}>
                        <div className={isFlightHolding ? "control_panel_content_row_percent holding":"control_panel_content_row_percent"}></div>
                        <div className={"control_panel_content_column"}>Take a Flight<i className="bi bi-arrow-right-short ml5" style={{scale: "1.5"}}></i></div>
                      </div>
                      )}
                    </>)
                  );
                })}
            </div>
          )}


          {/*{selectedAirport && selectedAirport["name"] && (<div className={"control_panel"}>*/}
          {/*  <div className={"control_panel_header"}>Selected Airport <i className="bi bi-buildings-fill" style={{marginLeft:"10px"}}></i></div>*/}
          {/*  <div className={"control_panel_content_row"}>*/}
          {/*    <div className={"control_panel_content_column"}>*/}
          {/*      <ReactTextTransition springConfig={presets.gentle} style={{minHeight:"50px", alignItems:"center"}}>{selectedAirport["name"]}</ReactTextTransition>*/}
          {/*    </div>*/}
          {/*    <div className={"control_panel_content_column"} style={{width:"150px"}}>*/}
          {/*      <ReactTextTransition springConfig={presets.gentle}>{expectedDistance !== "0" ? expectedDistance : "???"}</ReactTextTransition>*/}
          {/*      <i className="bi bi-fuel-pump-fill ml5"></i><p className={"ml5"}>km</p>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*  {findConnectionDistance(selectedAirport.ICAO,currentAirport.ICAO) !== "0" && (*/}
          {/*  <div className={"control_panel_content_row"} style={{cursor: "pointer"}}*/}
          {/*       onMouseDown={handleFlightMouseDown} onMouseUp={handleFlightMouseUp} onMouseLeave={handleFlightMouseUp}>*/}
          {/*    <div className={isFlightHolding ? "control_panel_content_row_percent holding":"control_panel_content_row_percent"}></div>*/}
          {/*    <div className={"control_panel_content_column"}>Take a Flight<i className="bi bi-arrow-right-short ml5" style={{scale: "1.5"}}></i></div>*/}
          {/*  </div>*/}
          {/*  )}*/}
          {/*</div>)}*/}

          {newEvent && (
          <div className={"control_panel"}>
            <div className={"control_panel_header"}>Lootbox <i className="bi bi-box-seam-fill" style={{marginLeft:"10px"}}></i></div>

            {eventType === "" && (
            <div className={"control_panel_content_row"} style={{cursor: "pointer"}}>
              <div className={"control_panel_content_column"} onClick={() => handleOpenLootbox("money")}>Open with 100 <i className="bi bi-currency-exchange ml5"></i></div>
              <div className={"control_panel_content_column"} onClick={() => handleOpenLootbox("fuel")}>Open with 50 <i className="bi bi-fuel-pump-fill ml5"></i></div>
            </div>
            )}

            {eventType === "diamond" && (<>
            <div className={"control_panel_content_row"}>
              <div className={"control_panel_content_column"}>You found <i className={"bi bi-gem marker-icon-diamond lootbox_icon"}></i></div>
            </div>
            <div className={"control_panel_content_row"}>
              <div className={"control_panel_content_column"}>Return to the initial airport to finish the game</div>
            </div></>
            )}
            {eventType === "topaz" && (
            <div className={"control_panel_content_row"}>
              <div className={"control_panel_content_column"}>You found <i className={"bi bi-diamond-fill marker-icon-topaz lootbox_icon"}></i> that's worth 300 <i className="bi bi-currency-exchange ml5"></i></div>
            </div>
            )}
            {eventType === "emerald" && (
            <div className={"control_panel_content_row"}>
              <div className={"control_panel_content_column"}>You found <i className={"bi bi-suit-diamond-fill marker-icon-emerald lootbox_icon"}></i> that's worth 600 <i className="bi bi-currency-exchange ml5"></i></div>
            </div>
            )}
            {eventType === "ruby" && (
            <div className={"control_panel_content_row"}>
              <div className={"control_panel_content_column"}>You found <i className={"bi bi-x-diamond-fill marker-icon-ruby lootbox_icon"}></i> that's worth 1000 <i className="bi bi-currency-exchange ml5"></i></div>
            </div>
            )}
            {eventType === "bandit" && (
            <div className={"control_panel_content_row"}>
              <div className={"control_panel_content_column"}>You met <i className={"bi bi-person-fill-x marker-icon-bandit lootbox_icon"}></i> You lose all your money <i className="bi bi-currency-exchange ml5"></i></div>
            </div>
            )}

          </div>
          )}
        </div>
        )}

        {gameStatus !== "game" && (
        <div className={"control_container"}>
          <div className={"control_panel"}>
            <div className={"control_panel_header"}>{gameStatus === "win" ? "You win":"You lose"}<i className="bi bi-person-fill ml5"></i></div>
            <div className={"control_panel_content_row"}>
              <div className={"control_panel_content_column"}>{visitedAirports.length} {" Airports Visited"}</div>
            </div>
          </div>
        </div>
        )}

      </div>
      </>)}

    </div>
  );
}

export default App;
