"use strict";
exports.__esModule = true;
var DEFAULTS = {
    zoom: 1,
    src: '',
    trigger: 'mousemove',
    effect: 'aside',
    debug: false,
    onShow: function () { },
    onHide: function () { },
    onMove: function () { },
    magnifier: {
        _class: 'magnifier'
    },
    preview: {
        _class: 'magnifier',
        pos: 'left'
    }
};
var Magnifier = /** @class */ (function () {
    // static one(_selector: string | HTMLElement, options?: MagnifierDefaults) {
    //     return new Magnifier(_selector, options)
    // }
    function Magnifier(_selector, options) {
        this.bigImgWidth = 0;
        this.bigImgHeight = 0;
        this.$img = $(null);
        this.$container = $(null);
        this.$magnifier = $(null);
        this.$bigImg = $(null);
        this.$preview = $(null);
        // super(_selector, DEFAULTS, options)
        this.$el = $(_selector);
        this.setup();
        this.bindEvent();
    }
    Magnifier.prototype.setup = function () {
        console.dir(this);
        console.dir(this.cfg);
        this.$container = this.$el;
        this.$img = this.$el.find('img');
        this.setWarpStyle();
        this.createMagnifier();
        this.loadBigPic();
    };
    Magnifier.prototype.setWarpStyle = function () {
        this.$container.css('position', 'relative');
    };
    Magnifier.prototype.createMagnifier = function () {
        var _this = this;
        var magnifierClass = this.cfg.magnifier._class;
        var createMagnifier = {
            'mousemove': function () {
                _this.$magnifier = $("<div data-magnifier style=\"display:none;position:absolute;top:0;left:0\"></div>");
                _this.$container.append(_this.$magnifier);
            },
            'doubleclick': function () { }
        };
        createMagnifier[this.cfg.trigger].call(this);
    };
    Magnifier.prototype.loadBigPic = function () {
        var _this = this;
        var $bigImg = document.createElement('img');
        $bigImg.onload = function () {
            // 加载
            console.log('big img loaded!');
            _this.$bigImg = $($bigImg);
            _this.bigImgWidth = $bigImg.width;
            _this.bigImgHeight = $bigImg.height;
            $($bigImg).css('position', 'absolute');
            // 绑定事件
            _this.bindEvent();
            // 构建预览
            _this.buildPreview();
        };
        $bigImg.onerror = function () {
            // 加载失败 不执行后面的放大效果
            throw 'big img load error';
        };
        $bigImg.src = this.cfg.src;
    };
    Magnifier.prototype.compatibleEvent = function () {
        var _this = this;
        var zoomTrigger = this.cfg.trigger;
        var handleEvent = {
            mousemove: function (e) {
                var _this = this;
                var moveType = {
                    aside: function (e, callback) {
                        // 计算出正确的坐标位置 0,0 . 基于 $wrap 的坐标系
                        var clientX = e.pageX - _this.$container.offset().left;
                        var clientY = e.pageY - _this.$container.offset().top;
                        // 边界校验            
                        var moveLeft = clientX - _this.$magnifier.width() / 2;
                        var moveTop = clientY - _this.$magnifier.height() / 2;
                        // spin 不能超越 父元素的边界
                        if (moveLeft <= 0)
                            moveLeft = 0;
                        if (moveLeft >= _this.$container.width() - _this.$magnifier.width())
                            moveLeft = _this.$container.width() - _this.$magnifier.width();
                        if (moveTop <= 0)
                            moveTop = 0;
                        if (moveTop >= _this.$container.height() - _this.$magnifier.height())
                            moveTop = _this.$container.height() - _this.$magnifier.height();
                        // 移动 spin
                        _this.$magnifier.css({
                            left: moveLeft + "px",
                            top: moveTop + "px"
                        });
                        // 移动图片
                        // 计算比例
                        var rateX = moveLeft / (_this.$container.width() - _this.$magnifier.width());
                        var rateY = moveTop / (_this.$container.height() - _this.$magnifier.height());
                        // 根据比例移动图片
                        _this.$bigImg.css({
                            left: -rateX * (_this.bigImgWidth - _this.$preview.width()) + 'px',
                            top: -rateY * (_this.bigImgHeight - _this.$preview.height()) + 'px'
                        });
                        callback && callback.call(_this, moveLeft, moveTop);
                    },
                    magnifier: function (e) {
                        console.log('mouse move ....');
                        _this.$magnifier.css({ display: 'none' });
                        // 计算出正确的坐标位置 0,0 . 基于 $container 的坐标系
                        var clientX = e.pageX - _this.$container.offset().left;
                        var clientY = e.pageY - _this.$container.offset().top;
                        // 边界校验            
                        var lensX = e.pageX - _this.$preview.width() / 2;
                        var lensY = e.pageY - _this.$preview.height() / 2;
                        // 移动图片
                        // 计算比例
                        var zoomX = -clientX / (_this.$container.width()) * (_this.bigImgWidth - _this.$preview.width() / 2);
                        var zoomY = -clientY / (_this.$container.height()) * (_this.bigImgHeight - _this.$preview.height() / 2);
                        // this.$preview.css({
                        //     left: lensX+'px',
                        //     top: lensY+'px'
                        // })
                        // this.$bigImg.css({
                        //     left: zoomX+'px',
                        //     top: zoomY+'px'
                        // })
                    },
                    cover: function (e) {
                    }
                };
                moveType[this.cfg.effect].call(this, e);
            },
            doubleclick: function (e) {
            }
        };
        var $container = this.$container.get(0);
        switch (zoomTrigger) {
            case '':
            case 'mousemove':
                $container.addEventListener('mousemove', function () {
                    console.log('addEventListener mousemove ....');
                }, false);
                this.$container.mousemove(function (e) {
                    console.log('mousemove .............');
                    console.log(_this);
                    console.dir(_this);
                    handleEvent[zoomTrigger].call(_this, e);
                    _this.cfg.onMove && _this.cfg.onMove.call(_this);
                });
                break;
            case 'doubleclick':
                $container.addEventListener('doubleclick', function (e) {
                    handleEvent[zoomTrigger].call(_this, e);
                    _this.cfg.onMove && _this.cfg.onMove.call(_this);
                }, false);
                break;
        }
    };
    Magnifier.prototype.bindEvent = function () {
        var _this = this;
        var $container = this.$container.get(0);
        this.$container.mouseenter(function () {
            _this.$preview.css('display', 'block');
            _this.$magnifier.css('display', 'block');
            _this.cfg.onShow && _this.cfg.onShow.call(_this);
        });
        this.$container.mouseleave(function (e) {
            console.log(e.target);
            console.log(e.currentTarget);
            console.log('mouse leave ....');
            _this.$preview.css('display', 'none');
            _this.$magnifier.css('display', 'none');
            _this.cfg.onHide && _this.cfg.onHide.call(_this);
        });
        // 适配指定的触发事件
        this.compatibleEvent();
    };
    Magnifier.prototype.buildPreview = function () {
        var _this = this;
        var previewType = {
            mousemove: {
                // 预览容器 magnifier 模式
                magnifier: function () {
                    // 隐藏 spin
                    _this.$magnifier.css('display', 'none');
                    _this.$preview.css({ left: '0px', top: '0px' });
                    $('body').append(_this.$preview);
                },
                // 预览容器 cover 模式
                cover: function () {
                    _this.$magnifier.css('display', 'none');
                    _this.$container.css({ overflow: 'hidden' });
                    _this.$preview.css({
                        width: _this.bigImgWidth + 'px',
                        Height: _this.bigImgHeight + 'px',
                        left: _this.$container.offset().left + 'px',
                        top: _this.$container.offset().top + 'px'
                    });
                    _this.$container.append(_this.$preview);
                },
                // 预览容器 aside 模式
                aside: function () {
                    switch (_this.cfg.preview.pos) {
                        case '':
                        case 'left':
                        case undefined:
                            _this.$preview.css({
                                top: _this.$container.offset().top + 'px',
                                left: _this.$container.offset().left + _this.$container.width() + 'px'
                            });
                            break;
                        case 'top':
                            _this.$preview.css({
                                top: _this.$container.offset().top - _this.$preview.height() + 'px',
                                left: _this.$container.offset().left + 'px'
                            });
                            break;
                        case 'right':
                            _this.$preview.css({
                                top: _this.$container.offset().top + 'px',
                                left: _this.$container.offset().left - _this.$preview.width() + 'px'
                            });
                            break;
                        case 'bottom':
                            _this.$preview.css({
                                top: _this.$container.offset().top + _this.$container.height() + 'px',
                                left: _this.$container.offset().left + 'px'
                            });
                            break;
                    }
                    $('body').append(_this.$preview);
                }
            },
            doubleclick: {
                magnifier: function () { },
                cover: function () { },
                aside: function () { }
            }
        };
        console.log('start build preview');
        console.log(this.$bigImg);
        this.$preview = $('<div data-preview style="display:none;position:absolute;top:0;left:0;"><div data-preview-img style="position:relative"></div></div>');
        this.$preview.find('[data-preview-img]').append(this.$bigImg);
        previewType[this.cfg.trigger][this.cfg.effect].call(this);
    };
    Magnifier.NAME = 'Magnifier';
    Magnifier.VERSION = '1.0.0';
    return Magnifier;
}());
exports.Magnifier = Magnifier;
