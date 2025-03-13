// Initialize and add the map
let map;

async function initMap() {
  console.log('tutorials/index.js');
  // The location of Uluru
  const position = { lat: -25.344, lng: 131.031 };
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // The map, centered at Uluru
  // zoomとcenterが必須
  // zoom「0」が地球全体、下記がおおよその基準
      // 1: 世界
      // 5: 陸塊または大陸
      // 10: 都市
      // 15: 通り
      // 20: 建物
  map = new Map(document.getElementById("map"), {
    zoom: 4,
    center: position,
    mapId: "DEMO_MAP_ID",
  });

  // The marker, positioned at Uluru
  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    title: "Uluru",
  });
}

initMap();