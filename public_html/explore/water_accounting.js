$(document).ready(function() {
	"use strict";
	window.owdiDrought = window.owdiDrought || {};
	window.owdiDrought.waterAccounting = {};

	// data layers
	owdiDrought.waterAccounting.layers = {}

	owdiDrought.waterAccounting.styles = {
		style1: {
			"fillOpacity": 0.5,
			"color": "#9d9d9d",
			"weight": 2,
			"fillColor": "#9d9d9d"
		},
		style2: {
			color: "#7F7FFF",
			weight: 5
		}
	}

	owdiDrought.waterAccounting.resetHighlight = function(e) {
		owdiDrought.waterAccounting.geojson.resetStyle(e.target);
		owdiDrought.waterAccounting.info.update();
	}

	owdiDrought.waterAccounting.zoomToFeature = function(e) {
		owdiDrought.waterAccounting.map.fitBounds(e.target.getBounds());
	}

	owdiDrought.waterAccounting.onEachFeature = function(feature, layer) {
		layer.on({
			mouseover: owdiDrought.waterAccounting.highlightFeature,
			mouseout: owdiDrought.waterAccounting.resetHighlight,
			click: owdiDrought.waterAccounting.zoomToFeature
		});
	}

	owdiDrought.waterAccounting.addDataToMap = function(data, style, layer, lc) {
		owdiDrought.waterAccounting.layers[layer] = L.geoJson(data, {
			onEachFeature: layer === "wat acc cont" ? owdiDrought.waterAccounting.onEachFeature : undefined,
			//pointToLayer: function(feature, latlng) {
			//   return L.circleMarker(latlng);
			//},
			style: style
		});
		owdiDrought.waterAccounting.layers[layer].addTo(owdiDrought.waterAccounting.map);
		owdiDrought.waterAccounting.group.addLayer(owdiDrought.waterAccounting.layers[layer])
		owdiDrought.waterAccounting.map.fitBounds(owdiDrought.waterAccounting.group.getBounds());

		// layer control
		if (lc != undefined) {
			L.control
				.layers(owdiDrought.waterAccounting.baseMaps, owdiDrought.waterAccounting.layers)
				.addTo(owdiDrought.waterAccounting.map);
		};
	};

	// get color depending on five year mean value
	owdiDrought.waterAccounting.getColor = function(d) {
		var color;

		if (d > 2500000) {
			color = "#3c4dfd";
		} else if (d > 400000) {
			color = "#6f7bfe";
		} else if (d > 600) {
			color = "#a1a9fe";
		} else if (d > 120) {
			color = "#d4d7ff"
		} else {
			color = "#eeefff"
		}

		return color;
	}

	owdiDrought.waterAccounting.style = function(feature) {
		return {
			weight: 2,
			color: 'white',
			dashArray: '3',
			fillColor: owdiDrought.waterAccounting.getColor(feature.properties.mean)
		};
	}

	owdiDrought.waterAccounting.highlightFeature = function(e) {
		var layer = e.target;

		layer.setStyle({
			weight: 5,
			color: '#FFFF00',
			dashArray: '',
			fillOpacity: 0.7
		});

		if (!L.Browser.ie && !L.Browser.opera) {
			layer.bringToFront();
		}

		owdiDrought.waterAccounting.info.update(layer.feature.properties);
	}

	// styling
	owdiDrought.waterAccounting.getValue = function(x) {
		return x > 2500000 ? 0 :
			x >= 400000 ? 33 :
			x >= 600 ? 20 :
			x >= 120 ? 7 :
			0;
	}

	owdiDrought.waterAccounting.map = L.map('map');

	owdiDrought.waterAccounting.group = new L.featureGroup;

	// control that shows state info on hover
	owdiDrought.waterAccounting.info = L.control();

	owdiDrought.waterAccounting.info.onAdd = function(map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	};

	owdiDrought.waterAccounting.info.update = function(props) {
		this._div.innerHTML = '<h2>Lower Colorado River Water Use Contracts</h2><br /> <h4>Five Year Mean</h4>' + (props ?
			'<b>' + props.Contractor + '</b><br />' + props.mean + ' acre feet' : 'Hover over a contractor polygon');
	};

	owdiDrought.waterAccounting.info.addTo(owdiDrought.waterAccounting.map);

	// Legend
	owdiDrought.waterAccounting.legend = L.control({
		position: 'bottomright'
	});

	owdiDrought.waterAccounting.legend.onAdd = function(map) {

		var div = L.DomUtil.create('div', 'info legend'),
			grades = [0, 120, 600, 400000, 2500000],
			labels = ["<b>Acre Feet</b>"],
			from, to;

		for (var i = 0; i < grades.length; i++) {
			from = grades[i];
			to = grades[i + 1];

			labels.push(
				'<i style="background:' + owdiDrought.waterAccounting.getColor(from + 1) + '"></i> ' +
				from + (to ? '&ndash;' + to : '+'));
		}
		labels.push(
			'<br/><i style="background:' + '#9d9d9d' + '"></i>Lower Colorado River Watershed');

		div.innerHTML = labels.join('<br>');
		return div;
	};

	owdiDrought.waterAccounting.legend.addTo(owdiDrought.waterAccounting.map);

	// scale bar
	L.control.scale().addTo(owdiDrought.waterAccounting.map);

	// base layers
	owdiDrought.waterAccounting.basemaps = {
		"OpenStreetMap": L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			"attribution": "&copy; <a href=\"http://openstreetmap.org/copyright\", target=\"_blank\">OpenStreetMap contributors</a>"
		}),
		"ESRI World Topo": L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
			"attribution": "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, \n    USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, \n    Esri China (Hong Kong), and the GIS User Community"
		})
	};

	owdiDrought.waterAccounting.basemaps.OpenStreetMap.addTo(owdiDrought.waterAccounting.map);
	owdiDrought.waterAccounting.basemaps["ESRI World Topo"].addTo(owdiDrought.waterAccounting.map);

	$.when(
		$.getJSON("../data/lc_huc_simp.geojson"),
		$.getJSON("../data/wat_acc_cont.geojson")
	).done(function(d1, d2) {
		owdiDrought.waterAccounting.addDataToMap(d1, owdiDrought.waterAccounting.styles.style1, "Lower Colorado River Watershed");

		owdiDrought.waterAccounting.addDataToMap(d2, owdiDrought.waterAccounting.styles.style2, "Water Contracts", "add");
		owdiDrought.waterAccounting.geojson = L.geoJson(d2, {
			style: owdiDrought.waterAccounting.style,
			onEachFeature: owdiDrought.waterAccounting.onEachFeature
		}).addTo(owdiDrought.waterAccounting.map);
	});

});
