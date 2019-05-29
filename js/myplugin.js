L.Control.SVA = L.Control.Layers.extend({

    options: {
        collapsed: true,
        autoZIndex: true,
        position: 'topright'
    },

    initialize: function (baseLayers, overlays, options) {
        L.Util.setOptions(this, options);

        // Useless ?
        this._layerControlInputs = [];
        this._layers = [];
        this._lastZIndex = 0;
        this._handlingClick = false;

        this._groups = {};
        this._items = {};

        // Create base layers
        for (let i in baseLayers) {
            // Check if the layer is inside a group
            if (baseLayers[i].group && baseLayers[i].layers) {
                for (let n in baseLayers[i].layers)
                    this._addLayer(baseLayers[i].layers[n], n,false, baseLayers[i].group);
            } else
                this._addLayer(baseLayers[i], i,false);
        }

        // Create overlays
        for (let i in overlays) {
            // Check if the layer is inside a group
            if (overlays[i].group && overlays[i].layers) {
                for (let n in overlays[i].layers)
                    this._addLayer(overlays[i].layers[n], i,true, overlays[i].group);
            } else
                this._addLayer(overlays[i], i,true);
        }
    },

    addBaseLayer: function (layer, name, group) {
        this._addLayer(layer, name,false, group);
        return (this._map) ? this._update() : this;
    },

    addOverlay: function (layer, name, group) {
        this._addLayer(layer, name,true, group);
        return (this._map) ? this._update() : this;
    },

    removeLayer: function (layerDef) {
        let layer = layerDef.hasOwnProperty('layer') ? this._layerFromDef(layerDef) : layerDef;
        return L.Control.Layers.prototype.removeLayer.call(this, layer);
    },

    _layerFromDef: function (layerDef) {
        for (let i = 0; i < this._layers.length; i++) {
            let id = L.stamp(this._layers[i].layer);
            if (this._getLayer(id).name === layerDef.name)
                return this._getLayer(id).layer;
        }
    },

    _getLayer: function (id) {
        for (let i = 0; i < this._layers.length; i++) {
            if (this._layers[i] && this._layers[i].id === id) {
                return this._layers[i];
            }
        }
    },

    _initLayout: function () {

        let container = this._container = L.DomUtil.create('div', 'leaflet-control-layers');

        //Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
        container.setAttribute('aria-haspopup', true);

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        if (this.options.collapsed) {
            this._map.on('click', this.collapse, this);

            if (!L.Browser.android) {
                L.DomEvent.on(container, {
                    mouseenter: this.expand,
                    mouseleave: this.collapse
                }, this);
            }
        }

        this._baseLayersList = L.DomUtil.create('div', this.className + '-base', container);
        this._separator = L.DomUtil.create('div', this.className + '-separator', container);
        this._overlaysList = L.DomUtil.create('div', this.className + '-overlays', container);


        container.appendChild(this._createSidebar());
        container.appendChild(this._createContent());

        if (this.options.collapsed) {
            this._map.on('click', this._collapse, this);
        } else {
            this._expand();
        }
    },

    _update: function () {
        this._groups = {};
        this._items = {};
        L.Control.Layers.prototype._update.call(this);
    },



    _addLayer: function (layerDef, name, isOverlay, group, isCollapsed) {

        if (!layerDef.layer)
            throw new Error('layer not defined in item: ' + (layerDef.name || ''));

        if (!(layerDef.layer instanceof L.Class) &&
            (layerDef.layer.type && layerDef.layer.args)) {
            layerDef.layer = this._getPath(L, layerDef.layer.type).apply(L, layerDef.layer.args);
        }

        if (!layerDef.hasOwnProperty('id'))
            layerDef.id = L.stamp(layerDef.layer);

        if (layerDef.active)
            this._layersActives.push(layerDef.layer);

        this._layers.push(L.Util.extend(layerDef, {
            collapsed: isCollapsed,
            overlay: isOverlay,
            group: group
        }));

        if (this.options.autoZIndex && layerDef.layer && layerDef.layer.setZIndex) {
            this._lastZIndex++;
            layerDef.layer.setZIndex(this._lastZIndex);
        }
    },

    // TODO: modifier
    _createItem: function (obj) {

        let self = this;

        let item, input, checked;

        item = L.DomUtil.create('div', this.className + '-item' + (obj.active ? ' active' : ''));

        checked = this._map.hasLayer(obj.layer);

        //Si c'est un overlay une checkbox
        if (obj.overlay) {
            input = L.DomUtil.create('input', this.className + '-selector');
            input.type = 'checkbox';
            input.defaultChecked = checked;
        }
        //sinon un radio input
        else
            input = this._createRadioElement('leaflet-base-layers', checked, obj);

        input.value = obj.id;
        input.layerId = obj.id;
        input.id = obj.id;
        input._layer = obj;

        L.DomEvent.on(input, 'click', function (e) {

            self._onInputClick();

            if (e.target.checked) {
                self.fire('panel:selected', e.target._layer);
            } else {
                self.fire('panel:unselected', e.target._layer);
            }

        }, this);

        let label = L.DomUtil.create('label', this.className + '-title');
        label.setAttribute('for', obj.id);
        label.innerHTML = obj.name || '';

        item.appendChild(input);
        item.appendChild(label);

        if (this.options.buildItem) {
            let node = this.options.buildItem.call(this, obj); //custom node node or html string
            if (typeof node === 'string') {
                let tmp = L.DomUtil.create('div');
                tmp.innerHTML = node;
                item.appendChild(tmp.firstChild);
            } else
                item.appendChild(node);
        }

        this._items[input.value] = item;

        return item;
    },

    //TODO: modifier
    _createRadioElement: function (name, checked, obj) {

        let radioHtml = '<input type="radio" class="' + this.className + '-selector" name="' + name + '" id="' + obj.id + '"';
        if (checked) {
            radioHtml += ' checked="checked"';
        }
        radioHtml += ' />';

        let radioFragment = document.createElement('div');
        radioFragment.innerHTML = radioHtml;

        return radioFragment.firstChild;
    },

    //TODO: modifier
    _addItem: function (obj) {
        let label;

        let list = obj.overlay ? this._overlaysList : this._baseLayersList;

        if (obj.group) {
            if (!obj.group.hasOwnProperty('name'))
                obj.group = {name: obj.group};

            if (!this._groups[obj.group.name]) {
                let collapsed = false;
                if (obj.collapsed === true)
                    collapsed = true;
                this._groups[obj.group.name] = this._createGroup(obj.group, collapsed);
            }

            list.appendChild(this._groups[obj.group.name]);
            list = this._groups[obj.group.name];
        }

        label = this._createItem(obj);

        list.appendChild(label);

        return label;
    },

    //TODO: modifier
    _createGroup: function (groupdata, isCollapsed) {

        let self = this,
            groupdiv = L.DomUtil.create('div', this.className + '-group'),
            grouplabel, grouptit, groupexp;

        if (this.options.collapsibleGroups) {

            L.DomUtil.addClass(groupdiv, 'collapsible');

            groupexp = L.DomUtil.create('i', this.className + '-icon', groupdiv);
            if (isCollapsed === true)
                groupexp.innerHTML = ' + ';
            else
                groupexp.innerHTML = ' - ';

            L.DomEvent.on(groupexp, 'click', function () {
                if (L.DomUtil.hasClass(groupdiv, 'expanded')) {
                    L.DomUtil.removeClass(groupdiv, 'expanded');
                    groupexp.innerHTML = ' + ';
                } else {
                    L.DomUtil.addClass(groupdiv, 'expanded');
                    groupexp.innerHTML = ' - ';
                }
                self._updateHeight();
            });

            if (isCollapsed === false)
                L.DomUtil.addClass(groupdiv, 'expanded');
        }

        grouplabel = L.DomUtil.create('label', this.className + '-grouplabel', groupdiv);
        grouptit = L.DomUtil.create('span', this.className + '-title', grouplabel);
        grouptit.innerHTML = groupdata.name;

        return groupdiv;
    },

    //TODO: modifier
    _onInputClick: function () {
        let i, input, obj,
            inputs = this._form.getElementsByClassName(this.className + '-selector'),
            inputsLen = inputs.length;

        this._handlingClick = true;

        for (i = 0; i < inputsLen; i++) {

            input = inputs[i];

            obj = this._getLayer(input.value);

            if (input.checked && !this._map.hasLayer(obj.layer)) {
                L.DomUtil.addClass(input.parentNode.parentNode, 'active');
                this._map.addLayer(obj.layer);

            } else if (!input.checked && this._map.hasLayer(obj.layer)) {
                L.DomUtil.removeClass(input.parentNode.parentNode, 'active');
                this._map.removeLayer(obj.layer);
            }
        }

        this._handlingClick = false;

        this._refocusOnMap();
    },

    //TODO: modifier
    _createSidebar: function () {
        let sidebarItem = this._sidebarItem = L.DomUtil.create('div', 'sidebar-items');

        let itemList = L.DomUtil.create('ul');

        let liBackground = L.DomUtil.create('li');
        let liLayer = L.DomUtil.create('li');
        let liFilter = L.DomUtil.create('li');
        let liCopyright = L.DomUtil.create('li');

        let linkBackground = L.DomUtil.create('a');
        linkBackground.setAttribute('href', '#map-background');
        let linkLayer = L.DomUtil.create('a');
        linkLayer.setAttribute('href', '#map-layer');
        let linkFilter = L.DomUtil.create('a');
        linkFilter.setAttribute('href', '#map-filter');
        let linkCopyright = L.DomUtil.create('a');
        linkCopyright.setAttribute('href', '#map-copyright');

        L.DomUtil.create('i', 'fas fa-map-marked-alt', linkBackground);
        L.DomUtil.create('i', 'fas fa-layer-group', linkLayer);
        L.DomUtil.create('i', 'fas fa-filter', linkFilter);
        L.DomUtil.create('i', 'fas fa-copyright', linkCopyright);

        liBackground.appendChild(linkBackground);
        liLayer.appendChild(linkLayer);
        liFilter.appendChild(linkFilter);
        liCopyright.appendChild(linkCopyright);

        itemList.appendChild(liBackground);
        itemList.appendChild(liLayer);
        itemList.appendChild(liFilter);
        itemList.appendChild(liCopyright);

        itemList.appendChild(liBackground);
        itemList.appendChild(liLayer);
        itemList.appendChild(liFilter);
        itemList.appendChild(liCopyright);

        sidebarItem.appendChild(itemList);

        return sidebarItem;
    },

    //TODO: modifier
    _createContent: function () {
        let sidebarContent = L.DomUtil.create('div', 'sidebar-contents');

        let divBackground = L.DomUtil.create('div');
        divBackground.setAttribute('id', '#map-background');
        let divLayer = L.DomUtil.create('div');
        divLayer.setAttribute('id', 'map-layer');
        let divFilter = L.DomUtil.create('div');
        divFilter.setAttribute('id', 'map-filter');
        let divCopyright = L.DomUtil.create('div');
        divCopyright.setAttribute('id', 'map-copyright');

        let titleBackground = L.DomUtil.create('h1');
        titleBackground.innerHTML = 'Fond de carte';
        let titleLayer = L.DomUtil.create('h1');
        titleLayer.innerHTML = 'Couche à ajouter';
        let titleFilter = L.DomUtil.create('h1');
        titleFilter.innerHTML = 'Filtres sur les arbres remarquables';
        let titleCopyright = L.DomUtil.create('h1');
        titleCopyright.innerHTML = 'Sources et attributions';

        divBackground.appendChild(titleBackground);
        divLayer.appendChild(titleLayer);
        divFilter.appendChild(titleFilter);
        divCopyright.appendChild(titleCopyright);

        sidebarContent.appendChild(divBackground);
        sidebarContent.appendChild(divLayer);
        sidebarContent.appendChild(divFilter);
        sidebarContent.appendChild(divCopyright);

        return sidebarContent;
    },

    _updateHeight: function (h) {
        h = h || this._map.getSize().y;

        this._form.style.height = h + 'px';
    },

    _expand: function () {
        L.DomUtil.addClass(this._container, 'expanded');
    },

    _collapse: function () {
        this._container.className = this._container.className.replace('expanded', '');
    },

    _getPath: function (obj, prop) {
        let parts = prop.split('.'),
            last = parts.pop(),
            len = parts.length,
            cur = parts[0],
            i = 1;

        if (len > 0)
            while ((obj = obj[cur]) && i < len)
                cur = parts[i++];

        if (obj)
            return obj[last];
    }
});

L.control.sva = function (baseLayers, overlays, options) {
    return new L.Control.SVA(baseLayers, overlays, options);
};


// ------------------------------------------------
// Test
// ------------------------------------------------
let sva = new L.control.sva(baseLayers, overLayers, {
    collapsibleGroups: true,
    collapsed: true
});

map.addControl(sva);