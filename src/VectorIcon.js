(function () {
    (function (window, document, undefined_) {
        "use strict";
        L.VectorIcon = {};
        L.VectorIcon.version = "1.0.0";
        L.VectorIcon.MAP_PIN = 'M16,52 C14,48 0,24 0,16 C0,8 8,0 16,0 C24,0 32,8 32,16 C32,24 18,48 16,52 Z';
        L.VectorIcon.Icon = L.Icon.extend({
            options: {
                iconSize: [32, 52],
                iconAnchor: [16, 52],
                popupAnchor: [2, -40],
                shadowAnchor: [0, 0],
                shadowSize: [0, 0],
                svgShadow: true, // false - no shadow, true - default shadow skew of half-width to the right and quarter height. Setting this overrides the shadow anchor and shadow size.
                className: "vector-marker",
                prefix: "fa",
                spinClass: "fa-spin",
                extraClasses: "",
                icon: "home",
                markerColor: "blue",
                shadowColor: "black",
                shadowOpacity: 0.5,
                fontIconColor: "white",
                /// All svg options below are used to auto-calculate the position of various elements.
                svgWidth: 32,
                svgHeight: 52,
                svgPath: L.VectorIcon.MAP_PIN,
                svgFontTop: 8, // Font top assuming svg height is still 52. Otherwise need to scale down.
                svgFontSize: 14, // Font size assuming svg width is still 32.
            },
            initialize: function (options) {
                options = L.Util.setOptions(this, options);
                options = this.options;
                if (!!options.iconSize && !options.iconAnchor) {
                    // User supplied an iconSize but not the iconAnchor.
                    options.iconAnchor = [0, 0];
                    options.iconAnchor[0] = Math.round(options.iconSize[0]/2);
                    options.iconAnchor[1] = options.iconSize[1];
                }
                
                
                this._bounce();
                return this;
            },
            _bounce: function() {
                var scope = this;
                this.bounce = function () {
                    var animId = null;
                    var start = null;
                    var duration = 0;
                    var bounces = 0;
                    var height = 100; // pixels
                    var doneCallback = function() { };
                    var bounceFrame = function(time) {
                        if (start === null) start = time;
                        var delta = time - start;
                        if (delta < duration){
                            animId = window.requestAnimationFrame(bounceFrame);
                            var unitDelta = ((2 * delta  / duration) * bounces % 2) - 1;
                            var curHeight = (1 - (unitDelta * unitDelta)) * height;
                            scope.setFloatHeight(curHeight);
                        } else {
                            scope.setFloatHeight(0);
                            doneCallback();
                        }
                    };
                    return function(opts) {
                        /// Bounces the marker icon
                        //scope = this;
                        opts = opts || {};
                        if (animId !== null) window.cancelAnimationFrame(animId);
                        if (!!opts.stop) {
                            duration = 0;
                            scope.setFloatHeight(0);
                            return;
                        }
                        bounces = opts.bounces || 1;
                        duration = opts.duration || 500;
                        height = opts.height || 50;
                        doneCallback = opts.onDone || function() { };
                        start = null;
                        //bounceFrame(0);
                        animId = window.requestAnimationFrame(bounceFrame);
                    }
                }();
            },
            setFloatHeight: function(height, icon, shadow) {
                icon = icon || this._iconDiv;
                shadow = shadow || this._shadowDiv;
                height = height || 0;
                if (!!icon) {
                    var floatIcon = icon.getElementsByClassName('float-container')[0];
                    floatIcon.style.transform = 'translate3d(0,' + (-height).toString() + 'px, 0)';
                }
                if (!!shadow) {
                    var floatIcon = shadow.getElementsByClassName('float-container')[0];
                    var shadowOpt = this.options.svgShadow;
                    if (typeof (shadowOpt) === 'boolean') {
                        shadowOpt = { skew: -0.25, scale: 0.5 }
                    }
                    var xOffset = -(height * shadowOpt.skew);
                    var yOffset = -(height * shadowOpt.scale);
                    floatIcon.style.transform = 'translate3d(' + xOffset + 'px,' + yOffset + 'px, 0)';
                }
            },
            _iconDiv: null,
            createIcon: function (oldIcon) {
                var div, icon, options, pin_path;
                div = (oldIcon && oldIcon.tagName === "DIV" ? oldIcon : document.createElement("div"));
                options = this.options;
                if (options.icon) {
                    icon = this._createInner();
                }
                pin_path = options.svgPath;
                var iPoint = L.point(options.iconSize);
                div.innerHTML = '<div class="float-container"><svg width="' + iPoint.x + 'px" height="' + iPoint.y + 'px" ' +
                    'preserveAspectRatio="none" '+
                    'viewBox="0 0 ' + options.svgWidth + ' ' + options.svgHeight + 
                    '" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
                    '<path d="' + pin_path + '" fill="' + options.markerColor + '"></path>' + 
                    icon + '</svg></div>';
                this._setIconStyles(div, "icon");
                this._setIconStyles(div, "icon-" + options.markerColor);
                this._iconDiv = div;
                return div;
            },
            _createInner: function () {
                var iconClass, iconColorClass, iconStyle, iconSpinClass, options;
                iconClass = void 0;
                iconSpinClass = "";
                iconColorClass = "";
                iconStyle = "style='";
                options = this.options;
                if (options.prefix === '' || options.icon.slice(0, options.prefix.length + 1) === options.prefix + "-") {
                    iconClass = options.icon;
                } else {
                    iconClass = options.prefix + "-" + options.icon;
                }
                if (options.spin && typeof options.spinClass === "string") {
                    iconSpinClass = options.spinClass;
                }
                if (options.fontIconColor) {
                    if (options.fontIconColor === "white" || options.fontIconColor === "black") {
                        iconColorClass = "icon-" + options.fontIconColor;
                    } else {
                        iconStyle += 'color: ' + options.fontIconColor + ';';
                    }
                }
                var size = L.point(options.iconSize);
                if (size.y != options.svgHeight) {
                    var fontTop = Math.round(options.svgFontTop * size.y / options.svgHeight);
                    iconStyle += 'top:' + fontTop + 'px;';
                }
                if (size.x != options.svgWidth) {
                    var fontSize = Math.round(options.svgFontSize * size.x / options.svgWidth);
                    iconStyle += 'font-size:' + fontSize + 'px;';
                    var fontWidth = size.x;
                    iconStyle += 'width:' + fontWidth + 'px;';
                }
                iconStyle += "' "; // close icon style.
                return "<i " + iconStyle + "class='" + options.extraClasses + " " + options.prefix + " " + iconClass + " " + iconSpinClass + " " + iconColorClass + "'></i>";
            },
            _setIconStyles: function (img, name) {
                var anchor, options, size;
                options = this.options;
                size = L.point(options.iconSize);
                anchor = void 0;
                anchor = L.point(options.iconAnchor);
                if (!anchor && size) {
                    anchor = size.divideBy(2, true);
                }
                img.className = "vector-marker-" + name + " " + options.className;
                if (anchor) {
                    img.style.marginLeft = (-anchor.x) + "px";
                    img.style.marginTop = (-anchor.y) + "px";
                }
                if (size) {
                    img.style.width = size.x + "px";
                    return img.style.height = size.y + "px";
                }
            },
            _shadowDiv: null,
            createShadow: function (oldIcon) {
                var div = (oldIcon && oldIcon.tagName === "DIV" ? oldIcon : document.createElement("div"));
                var options = this.options;
                var pin_path = options.svgPath;
                if (!options.svgShadow) return null; // No shadow.
                var shadowOpt = options.svgShadow;
                if (typeof (shadowOpt) === 'boolean') {
                    shadowOpt = {skew: -0.25, scale: 0.5}
                }
                var iSize = L.point(options.iconSize);
                var Ta = 1, Tb = 0, Tc = 0, Td = 1, Tx = 0, Ty = 0; // Transformation matrix
                Tc = shadowOpt.skew;
                Td = shadowOpt.scale;
                var viewWidth = options.svgWidth + options.svgHeight * Math.abs(shadowOpt.skew);
                var viewHeight = Math.abs(options.svgHeight * shadowOpt.scale);
                var finalSvgWidth = iSize.x * (viewWidth / options.svgWidth);
                var finalSvgHeight = Math.abs(iSize.y * shadowOpt.scale);
                Tx = (shadowOpt.skew < 0) ? options.svgHeight * Math.abs(shadowOpt.skew): 0;
                Ty = (shadowOpt.scale < 0) ? viewHeight : 0;
                var deltaTop = iSize.y * Math.min(1 - shadowOpt.scale, 1);

                // Only need to set the left edge if the skew is positive.
                // With skew positive, the SVG is not transformed to match the X-anchor point (Tx is 0)
                // The div element offset it needed to align the point.
                var deltaLeft = (shadowOpt.skew > 0) ? iSize.x - finalSvgWidth : 0;
                //deltaLeft = deltaLeft * iSize.x / options.svgWidth;
                var matString = Ta + ',' + Tb + ',' + Tc + ',' + Td + ',' + Tx + ',' + Ty;
                div.innerHTML = '<div class="float-container" style="position:relative; left:' + deltaLeft + 'px; top:' + deltaTop + 'px">' +
                    '<svg width="' + finalSvgWidth + 'px" height="' + finalSvgHeight + 'px" ' +
                    'preserveAspectRatio="none" ' +
                    'viewBox="0 0 ' + viewWidth + ' ' + viewHeight + '" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
                    '<g transform="matrix(' + matString + ')">' +
                    '<path d="' + pin_path + '" fill="' + options.shadowColor + '" fill-opacity="' + options.shadowOpacity + '"></path></g></svg></div>';

                this._setIconStyles(div, "vector-shadow");
                this._shadowDiv = div;
                return div;
            }
        });
        return L.VectorIcon.icon = function (options) {
            return new L.VectorIcon.Icon(options);
        };
    })(this, document);

}).call(this);
