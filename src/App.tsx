import React, { useState, useEffect, useRef } from 'react';
import ReactTextTransition, { presets } from 'react-text-transition';
import logo from './logo.svg';
import './App.css';


import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {stringify} from "querystring";

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
  // iconUrl: "https://cdn-icons-png.flaticon.com/128/5971/5971947.png",
  iconUrl: "https://cdn-icons-png.flaticon.com/128/16982/16982672.png",
  // iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  // iconSize: [50, 50],
  // iconAnchor: [25, 40],
  iconSize: [40, 40],
  iconAnchor: [6, 40],
});
// Иконка для маркера
const selectedMarkerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/2776/2776000.png",
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
    case "red":
      return L.divIcon({ className: "marker-icon marker-icon-red",iconSize: size,iconAnchor: anchor });
    case "blue":
      return L.divIcon({ className: "marker-icon marker-icon-blue",iconSize: size,iconAnchor: anchor });
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
    // case "question":
    //   return L.divIcon({ className: "marker-icon marker-icon-question", html: '<i class="bi bi-question-circle-fill"></i>',iconSize: size,iconAnchor: anchor });
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

  const [gameState, setGameState] = useState<string>("game");

  const [markers, setMarkers] = useState<{ [key: string]: any }>({
    "data": [
    {"ICAO":"1",  "position": [51.505, -0.09],   "name": "London", "type": "red" },
    // {"ICAO":"2",  "position": [48.8566, 9.3522], "name": "Paris", "type": "diamond" },
    // {"ICAO":"3",  "position": [40.7128, -4.006], "name": "New York", "type": "blue" },
    // {"ICAO":"4",  "position": [40, 0],  "name": "4", "type": "red" },
    // {"ICAO":"5",  "position": [40, 5],  "name": "5", "type": "blue" },
    // {"ICAO":"6",  "position": [40, 6],  "name": "6", "type": "topaz" },
    // {"ICAO":"7",  "position": [40, 7],  "name": "7", "type": "emerald" },
    // {"ICAO":"8",  "position": [40, 8],  "name": "8", "type": "ruby" },
    // {"ICAO":"9",  "position": [40, 9],  "name": "9", "type": "diamond" },
    // {"ICAO":"10", "position": [40, 10], "name": "10", "type": "bandit" },
    // {"ICAO":"11", "position": [40, 11], "name": "11", "type": "question" },
    // {"ICAO":"12", "position": [40, 12], "name": "12", "type": "checked" },
  ]
  });
  const [paths, setPaths] = useState<[number, number][][]>([]);

  const [currentMoney, setCurrentMoney] = useState<string>("12000");
  const [currentFuel, setCurrentFuel] = useState<string>("12000");

  const [currentAirport, setCurrentAirport] = useState<{ [key: string]: any }>({});
  // const [selectedAirport, setSelectedAirport] = useState<{ [key: string]: any }>({'ICAO': "choose_airport", 'position': [0, 0], 'name': 'Choose Airport', 'type': 'question'});
  const [selectedAirport, setSelectedAirport] = useState<{ [key: string]: any }>({});



  // =================================================================
  // Расчёт всех путей

  const [visitedAirports,   setVisitedAirports] = useState<string[]>([]);
  const [discoveredAirports,   setDiscoveredAirports] = useState<string[]>([]);

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
    // newDiscoveredPaths = newDiscoveredPaths.filter(
    //   (path) => !visitedPaths.includes(path) && !currentAirportPaths.includes(path)
    // );

    // Убираем пути, которые уже есть в visitedPaths и currentAirportPaths
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
    // Совпадение путей
    const arePathsEqual = (path1: [number, number][], path2: [number, number][]) => {
      if (path1.length !== path2.length) return false;
      return path1.every((point, index) =>
        point[0] === path2[index][0] && point[1] === path2[index][1]
      );
    };
    // newDiscoveredPaths = uniquePaths(newDiscoveredPaths).filter(
    //   (path) =>
    //     !visitedPaths.some(visitedPath => arePathsEqual(path, visitedPath)) &&
    //     !currentAirportPaths.some(currentPath => arePathsEqual(path, currentPath))
    // );

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
      // setMarkers({"data": data.data});
      setMarkers(data);
      setCurrentAirport(data["data"].find((airport:any) => airport.type === "home"))
      // console.log(data["data"].find((airport:any) => airport.type === "empty"))


      // // Выводим в консоль повторяющиеся строки
      // const connections = data["icao_connections"];  // Предполагается, что это массив подмассивов
      // const sortedConnections = connections.map((conn:any) => conn.slice(0, 2).sort().join(','));
      // const duplicates = sortedConnections.filter((conn:any, index:any, self:any) => self.indexOf(conn) !== index);
      // console.log("Повторяющиеся строки:", duplicates);


      // Генерация путей на основе icao_connections
      const generatedPaths: [number, number][][] = data["icao_connections"].map(
        (connection: [string, string]) => {
          const [ICAO1, ICAO2] = connection;

          // Найти координаты аэропортов по ICAO кодам
          const airport1 = data["data"].find((airport: any) => airport.ICAO === ICAO1);
          const airport2 = data["data"].find((airport: any) => airport.ICAO === ICAO2);

          // Возвращаем путь (линия между двумя точками)
          if (airport1 && airport2) {
            return [airport1.position, airport2.position];
          } else {
            return null;
          }
        }
      ).filter(Boolean);

      // console.log("paths",paths)
      setPaths(generatedPaths as [number, number][][]);

    } catch (error) {
      console.error('Failed to fetch markers:', error);
    }
  };

  useEffect(() => {
    fetchMarkers();
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

    setDiscoveredAirports((prevAirports) => [
      ...new Set([...prevAirports, currentAirport.ICAO]),
    ]);

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
  const [expectedDistance, setExpectedDistance] = useState<string>("0");

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
  useEffect(() => {
    setExpectedDistance(findConnectionDistance(selectedAirport.ICAO,currentAirport.ICAO))
  }, [selectedAirport]);
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

    // Обновляем markers["data"], устанавливая "discovered": true для текущего аэропорта
    // setMarkers((prevMarkers) => {
    //   const updatedData = prevMarkers.data.map((airport:any) =>
    //     airport.ICAO === currentAirport.ICAO
    //       ? { ...airport, discovered: true }
    //       : airport
    //   );
    //
    //   return {
    //     ...prevMarkers,
    //     data: updatedData,
    //   };
    // });

    if (currentAirport["discovered"] === false && currentAirport["type"] !== "empty" && currentAirport["type"] !== "home") {
      setNewEvent(true);
    }
    else {setNewEvent(false);}

    if (currentAirport["type"] === "empty" || currentAirport["type"] === "home") {
      setDiscoveredAirports((prevAirports) => [
        ...new Set([...prevAirports, currentAirport.ICAO]),
      ]);

      // Обновляем состояние currentAirport
      // const updatedAirport = { ...currentAirport, discovered: true };
      // setCurrentAirport(updatedAirport);

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

    // console.log("currentAirport",currentAirport);
    // console.log("setVisitedAirports",visitedAirports);
    setVisitedAirports((prevAirports) => [
      ...new Set([...prevAirports, currentAirport.ICAO]),
    ]);

    // Проверка победы
    if (diamondFound && currentAirport["type"] === "home") {
      setGameState("win");
    }

  }, [currentAirport]);
  // =================================================================



  // =================================================================
  // Обработка победы

  const [diamondFound,   setDiamondFound] = useState<boolean>(false);

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
      <div className="header">
        <h2>Afrikan Tähti</h2>

      </div>
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

            {/*{paths.map((path, index) => (*/}
            {/*<Polyline key={index} positions={path} pathOptions={polylineOptions} />*/}
            {/*))}*/}
            {/*{visitedPaths.map((path, index) => (*/}
            {/*  Array.isArray(path) && path.length > 1 ? (*/}
            {/*    <Polyline key={index} positions={path} color={"green"} />*/}
            {/*  ) : null*/}
            {/*))}*/}{/**/}
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
                <Tooltip>{marker.type} = {marker.name} {findConnectionDistance(marker.ICAO,currentAirport.ICAO) !== "0" ? `- ${findConnectionDistance(marker.ICAO,currentAirport.ICAO)} km` : ""}</Tooltip>
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
              {/*<Tooltip><div className="custom-popup">Selected Airport - {findConnectionDistance(selectedAirport.ICAO,currentAirport.ICAO)} km</div></Tooltip>*/}
              <Tooltip><div className="custom-popup">Selected Airport {findConnectionDistance(selectedAirport.ICAO,currentAirport.ICAO) !== "0" ? `- ${findConnectionDistance(selectedAirport.ICAO,currentAirport.ICAO)} km` : ""}</div></Tooltip>
            </Marker>
            )}
          </MapContainer>
        </div>
        )}

        {gameState === "game" && (
        <div className={"control_container"}>
          <div className={"control_panel"}>
            <div className={"control_panel_header"}>Player Info<i className="bi bi-person-fill ml5"></i></div>
            <div className={"control_panel_content_row"}>
              {/*<div className={"control_panel_content_column"}>{currentMoney}<i className="bi bi-currency-exchange ml5"></i></div>*/}
              <div className={"control_panel_content_column"} title={"Current Money"}>
                {currentMoney.split("").map((txt, i) => (
                  <ReactTextTransition key={i} delay={i * 100} className="big" inline>{txt}</ReactTextTransition>
                ))}
                <i className="bi bi-currency-exchange ml5" onClick={()=>setCurrentMoney((Number(currentMoney)+1000).toString())}></i></div>
              <div className={"control_panel_content_column"} title={"Current Fuel"}>
                {currentFuel.split("").map((txt, i) => (
                  <ReactTextTransition key={i} delay={i * 100} className="big" inline>{txt}</ReactTextTransition>
                ))}
                <i className="bi bi-fuel-pump-fill ml5"></i><p style={{marginLeft:"5px"}}>km</p>
              </div>
            </div>
            {/*<div className={"control_panel_content_row"}><div className={"control_panel_content_column"}>{currentAirport["name"]}</div></div>*/}
            <div className={"control_panel_content_row"}><div className={"control_panel_content_column"}>
                <ReactTextTransition springConfig={presets.gentle}>{currentAirport["name"] || "Loading..."}</ReactTextTransition></div></div>
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
              <div className={"control_panel_header"}>Available Airports</div>
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
                      <div key={index} className={"control_panel_content_row airport_row_with_hover"} style={{backgroundColor: (selectedAirport === otherAirport) ? "#e4e4e4":""}}
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

          {/*{1 && (*/}
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

        {gameState !== "game" && (
        <div className={"control_container"}>
          <div className={"control_panel"}>
            <div className={"control_panel_header"}>{gameState === "win" ? "You win":"You lose"}<i className="bi bi-person-fill ml5"></i></div>
            <div className={"control_panel_content_row"}>
              <div className={"control_panel_content_column"}>{visitedAirports.length} {" Airports Visited"}</div>
            </div>
          </div>
        </div>
        )}

      </div>

    </div>
  );
}

export default App;
