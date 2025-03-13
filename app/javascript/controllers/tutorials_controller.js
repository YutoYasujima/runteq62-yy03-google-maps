import { Controller } from "@hotwired/stimulus";
import { loadGoogleMaps } from "./google_maps_loader";

export default class extends Controller {
  static targets = ["map"];

  connect() {
    console.log("Tutorials Controller Connected");
    loadGoogleMaps(this.element.dataset.apiKey).then(() => this.initMap());
  }

  async initMap() {
    console.log("Initializing Tutorial Map...");

    const positions = [
      { lat: 35.6812996, lng: 139.7670658 },
      { lat: 35.6811836, lng: 139.7741538 },
      { lat: 35.6770333, lng: 139.7709587 },
      { lat: 35.6750133, lng: 139.7630204 }
    ];

    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    this.map = new Map(this.mapTarget, {
      zoom: 15,
      center: positions[0],
      mapId: "DEMO_MAP_ID",
    });

    // スケール / イベント
    const pinScale = new PinElement({
      scale: 1.5,
    });
    const clickableMarker = new AdvancedMarkerElement({
      map: this.map,
      position: positions[0],
      content: pinScale.element,
      title: "Tokyo Station",
      gmpClickable: true,
    });
    const infoWindow = new InfoWindow();

    clickableMarker.addListener("click", ({ domEvent, latLng }) => {
      const { target } = domEvent;

      infoWindow.close();
      infoWindow.setContent(clickableMarker.title);
      infoWindow.open(clickableMarker.map, clickableMarker);
      alert('hello');
    });

    // カラー
    const pinColor = new PinElement({
      background: "#FBBC04",
      borderColor: "green",
    });
    new AdvancedMarkerElement({
      map: this.map,
      position: positions[1],
      content: pinColor.element,
      title: "Nihonbashi",
    });

    // グリフ(マーカーの真ん中の部分)
    const pinGlyph  = new PinElement({
      glyph: "京",
      // glyph: "", 非表示にできる
      glyphColor: "white", // グリフの色とマーカーの背景色と同色にすることでも非表示にできる
    });
    new AdvancedMarkerElement({
      map: this.map,
      position: positions[2],
      content: pinGlyph.element,
      title: "京橋",
    });

    // カスタム画像ファイルをマーカーに使用
    const beachFlagImg = document.createElement("img");
    beachFlagImg.src = this.element.dataset.imageUrl;
    beachFlagImg.style.width = "40px";  // 画像の幅を指定
    beachFlagImg.style.height = "40px"; // 画像の高さを指定
    const glyphSvgPinElement = new PinElement({
      glyph: beachFlagImg,
    });
    const glyphSvgMarkerView   = new AdvancedMarkerElement({
      map: this.map,
      position: positions[3],
      content: glyphSvgPinElement.element,
      title: "A marker using a custom PNG Image",
    });

    // 線分描画
    // 座標(緯度・経度)をpathにしてしている
    const flightPath = new google.maps.Polyline({
      path: positions,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 4,
    });

    flightPath.setMap(this.map);
    // flightPath.setMap(null); 地図上から線分の表示を除去 設定は削除されない

    // 三角形描画
    const trianglePositions = [
      { lat: (35.685175+0.01), lng: (139.7527995) },
      { lat: (35.685175-0.005), lng: (139.7527995+0.01) },
      { lat: (35.685175-0.005), lng: (139.7527995-0.01) },
    ];
    const innerTrianglePositions = [
      { lat: (35.685175+0.005), lng: (139.7527995) },
      { lat: (35.685175+0.0025), lng: (139.7527995-0.005) },
      { lat: (35.685175+0.0025), lng: (139.7527995+0.005) },
    ];
    const kokyoTriangle = new google.maps.Polygon({
      paths: [trianglePositions, innerTrianglePositions],
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
    });

    kokyoTriangle.setMap(this.map);

    // 長方形描画
    const rectangle = new google.maps.Rectangle({
      strokeColor: "#0000FF",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#0000FF",
      fillOpacity: 0.35,
      map: this.map,
      bounds: {
        north: (35.6812996+0.001),
        south: (35.6812996-0.001),
        east: (139.7670658+0.0015),
        west: (139.7670658-0.0015),
      },
    });

    // 円描画
    const cityCircle = new google.maps.Circle({
      strokeColor: "#00FF00",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#00FF00",
      fillOpacity: 0.35,
      map: this.map,
      center: { lat: 35.6918216, lng: 139.7709318 },
      radius: 500,
    });
  }
}
