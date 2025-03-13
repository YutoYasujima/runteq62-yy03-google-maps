let map;
let geocoder;
const display = document.getElementById('display');

export function initMap() {
  console.log('maps/index.js');
  geocoder = new google.maps.Geocoder();

  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 40.7828, lng:-73.9653 },
    zoom: 12,
  });

  marker = new google.maps.Marker({
    map: map,
    position:  { lat: 40.7828, lng:-73.9653 }
  });
}

function codeAddress(){
  let inputAddress = document.getElementById('address').value;

  // 'location': { lat: 緯度, lng: 経度 }でリバースジオコーディングができる
  geocoder.geocode( { 'address': inputAddress}, function(results, status) {
    if (status == 'OK') {
      map.setCenter(results[0].geometry.location);
      map.setZoom(14);
      var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
      });
      display.textContent = "検索結果：" + results[ 0 ].geometry.location
    } else {
      alert('該当する結果がありませんでした：' + status);
    }
  });
}
