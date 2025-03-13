import { Controller } from "@hotwired/stimulus";
import { loadGoogleMaps } from "./google_maps_loader";

export default class extends Controller {
  static targets = ["map", "address", "places","display"];

  connect() {
    console.log("Maps Controller Connected");
    loadGoogleMaps(this.element.dataset.apiKey).then(() => this.initMap());
  }

  initMap() {
    console.log("Initializing Map...");

    this.tokyoStation = {lat: 35.6812996, lng: 139.7670658};

    // Googleマップ作成
    this.map = new google.maps.Map(this.mapTarget, {
      center: this.tokyoStation,
      zoom: 15,
      mapId: "DEMO_MAP_ID",
    });

    // 地図上のマーカー作成
    new google.maps.Marker({
      map: this.map,
      position: this.tokyoStation,
    });

    // Geocoding、Reverse Geocodingをするためのインスタンス作成
    this.geocoder = new google.maps.Geocoder();

    // places APIを使うためのインスタンス作成
    // 施設検索ができる？
    // this.service = new google.maps.places.PlacesService(this.map);

    // Reverse Geocoding
    // クリックした位置(緯度・経度)から住所を割り出す
    this.map.addListener('click', e => {
      this.geocoder.geocode({
        location: e.latLng,
      },
      (results, status) => { // resultは変換結果、statusは処理の状況
        if (status !== 'OK') {
          alert(`リバースジオコーディング失敗：${status}`);
          return;
        }
        // results[0].formatted_addressに詳細な住所がある
        if (results[0]) {
          new  google.maps.Marker({
            position: e.latLng,
            map: this.map,
            title: results[0].formatted_address,
            animation: google.maps.Animation.DROP,
          });
        } else {
          alert(`リバースジオコーディング失敗：結果なし}`);
          return;
        }
      });
    });
  }

  codeAddress() {
    const inputAddress = this.addressTarget.value;

    // Geocoding
    this.geocoder.geocode({
      address: inputAddress,
    },
    (results, status) => { // resultは変換結果、statusは処理の状況
      if (status !== 'OK') {
        alert(`該当する結果がありませんでした：${status}`);
        return;
      }
      // results[0].geometry.locationは緯度・経度を持つオブジェクト
      if (results[0]) {
        this.map.setCenter(results[0].geometry.location);
        this.map.setZoom(16);

        new google.maps.Marker({
          map: this.map,
          position: results[0].geometry.location
        });

        this.displayTarget.textContent = `検索結果：${results[0].geometry.location}`;
      } else {
        alert('No results found');
        return;
      }
    });
  }

  // 東京駅半径500ｍ内のレストラン情報取得
  // 使用するmapのインスタンス作成時に「mapId」オプションが無いとエラーになる？
  // https://developers.google.com/maps/documentation/javascript/nearby-search?hl=ja&_gl=1*rdncoz*_up*MQ..*_ga*MjAyMjk1ODc0OS4xNzQxNTg2NTc4*_ga_NRWSTWS78N*MTc0MTU4NjU3Ny4xLjEuMTc0MTU4NjU4Ni4wLjAuMA..
  async nearbySearch() {
    // places API
    // Places API は、さまざまな方法で位置情報の HTTP リクエストを受け入れるサービスです。
    // 施設、地理的位置、有名なスポットに関するフォーマットされた位置情報と画像を返します。

    //@ts-ignore
    const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary(
      "places",
    );
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    // Restrict within the map viewport.
    // let center = new google.maps.LatLng(52.369358, 4.889258);
    // let center = this.tokyoStation;
    let center = new google.maps.LatLng(35.681236, 139.767125); // 東京駅の緯度経度

    const request = {
      // required parameters
      fields: ["displayName", "location", "businessStatus"], // どのような情報を取得するか？
      locationRestriction: {
        center: center,
        radius: 500,
      },
      // optional parameters
      includedPrimaryTypes: ["restaurant"], // タイプがレストランの情報を取得
      maxResultCount: 5, // ５件の情報を取得
      rankPreference: SearchNearbyRankPreference.POPULARITY,
      language: "ja",
      // region: "ja",
    };
    //@ts-ignore
    const { places } = await Place.searchNearby(request);

    if (places.length) {
      console.log(places);

      const { LatLngBounds } = await google.maps.importLibrary("core");
      const bounds = new LatLngBounds();

      // Loop through and get all the results.
      places.forEach((place) => {
        const markerView = new AdvancedMarkerElement({
          map: this.map,
          position: place.location,
          title: place.displayName,
        });

        bounds.extend(place.location);
        console.log(place);
      });
      this.map.fitBounds(bounds);
    } else {
      console.log("No results");
    }
  }
}

// Geocoding: Address -> LatLng
// Reverse Geocoding: LatLng -> Address

// // リバースジオコーディングのサンプル
// function addressDescriptorReverseGeocoding() {
//   var latlng = new google.maps.LatLng(28.640964,77.235875);
//   geocoder
//     .geocode({
//       'location': latlng,
//       'extraComputations': ["ADDRESS_DESCRIPTORS"],
//     })
//     .then((response) => {
//       console.log(response.address_descriptor);
//     })
//     .catch((error) => {
//       window.alert(`Error`);
//     });
// }


// おそらくplace API(旧)の書き方
// 周辺の施設を検索する
    // this.service.nearbySearch({
    //   location: this.tokyoStation,
    //   radius: '500', // 半径500m
    //   name: inputAddress // 入力フォームで入力されたキーワード
    // },
    // (results, status) => { // resultは変換結果、statusは処理の状況
    //   if (status !== google.maps.places.PlacesServiceStatus.OK) {
    //     alert(`該当する結果がありませんでした(places API)：${status}`);
    //     return;
    //   }
    //   for (let i = 0; i < results.length; i++) {
    //     new google.maps.Marker({
    //       map: this.map,
    //       position: results[i].geometry.location, // 緯度・経度
    //       title: results[i].name, // 検索した施設の名前
    //     });
    //   }
    // });

    // async searchFacilities() {
    //   // places API
    //   // Places API は、さまざまな方法で位置情報の HTTP リクエストを受け入れるサービスです。施設、地理的位置、有名なスポットに関するフォーマットされた位置情報と画像を返します。

    //   const url = `https://places.googleapis.com/v1/places:searchNearby`;
    //   const inputAddress = this.placesTarget.value;

    //   const response = await fetch(url, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "X-Goog-Api-Key": this.element.dataset.apiKey,
    //       "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location",
    //     },
    //     body: JSON.stringify({
    //       includedTypes: ["restaurant"], // レストランを検索
    //       locationRestriction: {
    //         circle: {
    //           center: this.tokyoStation, // 東京駅の座標
    //           radius: 500, // 半径500m
    //         },
    //       },
    //     }),
    //   });
  
    //   const data = await response.json();
    //   console.log(data);
    // }