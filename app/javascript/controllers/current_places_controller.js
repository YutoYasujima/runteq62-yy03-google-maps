import { Controller } from "@hotwired/stimulus"
import { loadGoogleMaps } from "./google_maps_loader";

// Connects to data-controller="current-places"
export default class extends Controller {
  static targets = ["map"];

  connect() {
      console.log("current_places Controller Connected");
      loadGoogleMaps(this.element.dataset.apiKey).then(() => this.initMap());
  }

  async initMap() {
    console.log("Initializing Map...");

    const { Geocoder } = await google.maps.importLibrary("geocoding");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    const position = { lat: 35.6812996, lng: 139.7670658 };

    // Geocoding、Reverse Geocodingをするためのインスタンス作成
    // this.geocoder = new google.maps.Geocoder();
    this.geocoder = new Geocoder();

    // mapインスタンスに設定できるオプション一覧は書き
    // https://developers.google.com/maps/documentation/javascript/reference/map?hl=ja&_gl=1*wwrlzq*_up*MQ..*_ga*MTMzMjc5ODg3NC4xNzQxNTA1MDQw*_ga_NRWSTWS78N*MTc0MTUwNTAzOS4xLjEuMTc0MTUwNTA0Mi4wLjAuMA..
    this.map = new google.maps.Map(this.mapTarget, {
      center: position,
      zoom: 16,
      disableDefaultUI: true, // マップに表示されている全UIの無効化
      zoomControl: true, // ズーム用UIの有効化
      mapId: 'tempMap',
    });

    // マップ上のクリックした場所の緯度・経度取得
    // 「addListener」であることに注意！
    this.map.addListener('click', e => {
      console.log(e.latLng.lat());
      console.log(e.latLng.lng());
      console.log(e.latLng.toString());
      // クリックした位置をマップの中央として表示移動する
      this.map.setCenter(e.latLng);
    });

    // マーカー作成
    new google.maps.Marker({
      map: this.map,
      position: position,
      title: '現在地だよ',
      icon: {
        url: this.element.dataset.imageUrl,
        scaledSize: new google.maps.Size(40, 40),
      },
      // animation: google.maps.Animation.BOUNCE
      animation: google.maps.Animation.DROP
    });

    // // クリックした位置にマーカーを付ける
    // this.map.addListener('click', e => {
    //   let marker = new google.maps.Marker({
    //     position: e.latLng,
    //     map: this.map,
    //     title: e.latLng.toString(),
    //     animation: google.maps.Animation.DROP
    //   });

    //   // マーカーをクリックしたらマーカーを削除する
    //   marker.addListener('click', () => {
    //     marker.setMap(null);
    //   });
    // });

    // // マーカーと情報ウィンドウを紐付ける
    // this.map.addListener('click', e => {
    //   let marker = new google.maps.Marker({
    //     position: e.latLng,
    //     map: this.map,
    //     animation: google.maps.Animation.DROP,
    //   });
    //   let infoWindow = new google.maps.InfoWindow({
    //     content: e.latLng.toString(), // positionは指定しない
    //   });
    //   // マーカーがクリックされたら情報ウィンドウを表示
    //   marker.addListener('click', () => {
    //     infoWindow.open(this.map, marker);
    //   });
    // });

    // 現在地取得処理
    const locationButton = document.createElement("button");
    const infoWindow = new google.maps.InfoWindow();
    locationButton.textContent = "現在地を取得する";
    // locationButton.classList.add("custom-map-control-button");
    // マップ上の上部真ん中にボタンを配置する
    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
    locationButton.addEventListener("click", () => {
      // ブラウザに現在地取得機能があるか確認
      if (!navigator.geolocation) {
        this.handleLocationError(false, infoWindow, this.map.getCenter());
        return;
      }

      // 現在地の取得
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude, // 現在地の緯度取得
            lng: position.coords.longitude, // 現在地の経度取得
          };
          // マップの位置修正
          this.map.setCenter(pos);
          this.map.setZoom(16);

          //  ↓*** ウィンドウをnewから作る方法 ***↓
          // infoWindow = new google.maps.InfoWindow({
            //   position: pos,
            //   content: "<a href=\"#\">現在地</a>発見！！！！！！！！！！！！", // HTMLの要素も表示できる
            //   maxWidth: 100,
            // });
            //  ↑*** ウィンドウをnewから作る方法 ***↑

          // ウィンドウの設定
          // infoWindow.setPosition(pos);
          // infoWindow.setContent("Location found.");
          // infoWindow.open(this.map);

          // ドラッグ可能マーカー
          const draggableMarker = new AdvancedMarkerElement({
            map: this.map,
            position: pos,
            gmpDraggable: true, // ドラッグ可能になる
            title: "This marker is draggable.",
          });
          draggableMarker.addListener('dragend', e => {
            const position = draggableMarker.position;

            infoWindow.close();
            infoWindow.setContent(`Pin dropped at: ${position.lat}, ${position.lng}`);
            infoWindow.open(draggableMarker.map, draggableMarker);
          });
        },
        // ユーザーが位置情報の取得を拒否した場合
        () => {
          this.handleLocationError(true, infoWindow, this.map.getCenter());
        },
        {
          enableHighAccuracy: true, // 高精度モードを有効化
          timeout: 10000, // 10秒でタイムアウト
          maximumAge: 0, // キャッシュを使わない
        }
      );
    });
  }

  handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation.",
    );
    infoWindow.open(this.map);
  }
}

