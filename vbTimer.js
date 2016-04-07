/*
A jQuery plugin to create timers using current time and the future date.
@author: Vipan Balrai
*/
(function($) {
  var _timers = {};
  var _defaults = {
    prefix: 'vbTimer',
    level: 'days',
    delimiter: ':',
    wrapper: {
      el: 'p',
      elClass: 'countdown'
    },
    years:{
      el: 'span',
      elClass: 'cd-days',
      suffix: '',
      prefix: ''
    },
    days: {
      el: 'span',
      elClass: 'cd-days',
      suffix: '',
      prefix: ''
    },
    hours: {
      el: 'span',
      elClass: 'cd-hours',
      suffix: '',
      prefix: ''
    },
    minutes: {
      el: 'span',
      elClass: 'cd-mins',
      suffix: '',
      prefix: ''
    },
    seconds: {
      el: 'span',
      elClass: 'cd-secs',
      suffix: '',
      prefix: ''
    },
  };
  
  var Timer = function (obj, options) {
    this.data = options;
    this._el = obj;
  };
  
  Timer.prototype.start = function (show) {
    this._show = show === 'show'? true: false;
    this.init();
    this._handle = setInterval(function () {
      this._ps -= 1;
  
      if(this._ps < 0) {
        this._ps = 59;
        this._pm -= 1;
      }
      
      if(this._pm < 0) {
        this._pm = 59;
        this._ph -= 1;
      }
      
      if(this._ph < 0) {
        this._ph = 23;
        this._pd -= 1;
      }
      
      if( this.canStop() ) {
        this.stop();
      } else {
        this._show && this._el.html(this.getHtml());
      }
    }.bind(this), 1000);
  };
  
  Timer.prototype.getHtml = function () {
    var html = '', eid = this._el.attr('id'), o = this.data;
     
    html = '<' + o.wrapper.el + ' class="' + o.wrapper.elClass +'" id="wrapper_' + eid + '">';
    
    if (this._py != undefined) {
      html += '<' + o.years.el + ' class="' + o.years.elClass + '" id="years_' + eid + '">';
      html += o.years.prefix + this.padNumber(this._py) + o.years.suffix;
      html += o.delimiter + '</' + o.years.el + '>';
    }
    
    if (this._pd != undefined) {
      html += '<' + o.days.el + ' class="' + o.days.elClass + '" id="days_' + eid + '">';
      html += o.days.prefix + this.padNumber(this._pd) + o.days.suffix;
      html += o.delimiter + '</' + o.days.el + '>';
    }
    
    if (this._ph != undefined) {
      html += '<' + o.hours.el + ' class="' + o.hours.elClass + '" id="hours_' + eid + '">';
      html += o.hours.prefix + this.padNumber(this._ph) + o.hours.suffix;
      html += o.delimiter + '</' + o.hours.el + '>';
    }
    
    if (this._pm != undefined) {
      html += '<' + o.minutes.el + ' class="' + o.minutes.elClass + '" id="minutes_' + eid + '">';
      html += o.minutes.prefix + this.padNumber(this._pm) + o.minutes.suffix;
      html += o.delimiter + '</' + o.minutes.el + '>';
    }
    
    if (this._ps != undefined) {
      html += '<' + o.seconds.el + ' class="' + o.seconds.elClass + '" id="seconds_' + eid + '">';
      html += o.seconds.prefix + this.padNumber(this._ps) + o.seconds.suffix; 
      html += '</' + o.seconds.el + '>';
    }
    
    html += '</' + o.wrapper.el + '>';
    return html;
  };
  
  
  
  Timer.prototype.setFormat = function (options) {
    this.data = $.extend(true, this.data, options);
  };
  
  Timer.prototype.canStop = function () {
    switch (this.data.level) {
      case 'years':
        return (this._py && this._py <= 0) ? true : false;
        break;
      case 'days':
        return (this._pd && this._pd <= 0) ? true : false;
        break;
      case 'hours':
        return (this._ph && this._ph <= 0) ? true : false;
        break;
    }
  }
  
  Timer.prototype.padNumber = function (n) {
    return (n < 10)? ("0"+n): n;
  };
  
  Timer.prototype.stop = function () {
    clearInterval(this._handle);
  };
  
  Timer.prototype.setDate = function (tillDate) {
    if (typeof tillDate === 'string') {
      this._d = new Date(tillDate.replace(/-/ig,'/'));
    } else if (typeof tillDate === 'array' && tillDate.length >= 3) {
      var ds = '';
      for(var i=0; i<tillDate.length-1; i++) {
        ds = tillDate[i] + '-';
      }
      ds += tillDate[tillDate.length-1];
      this._d = new Date(ds);
    } else {
      throw new Error('Date string of type "YYYY-MM-DD HH:MM:SS" or a Date array is required.');
    }
  };
  
  Timer.prototype.init = function () {
    var c = new Date();
    this._ms = this._d - c;
    this._th = this._ms / 3600000;
    this._tm = this._th * 60;
    this._ts = this._tm * 60;
    
    this._pd = Math.floor(this._th / 24);
    this._ph = Math.floor(this._th % 24);
    this._pm = Math.floor(this._tm % 60);
    this._ps = Math.floor(this._ts % 60);
    this._pms = Math.floor((this._ts * 1000) % 1000);
  };
  
  $.fn.balrai = function (options) {
    var $this = this;
    var options = $.extend(_defaults, options);
    
    return {
      create: function () {
        $this.each(function () {
          var obj = $(this);
          
          if (_timers.hasOwnProperty(obj.attr('id'))) {
            return _timers[obj.attr('id')];
          }

          if (!obj.attr('id')) {
            var id = Date.now() + Math.random().toString(16).replace('0.','');
            id = options.prefix + '_' + id;
            obj.attr('id', id);
          }
          
          _timers[obj.attr('id')] = new Timer(obj, options);
          return _timers[obj.data('timerId')];          
        });
      },
      getTimer: function (id) {
        if (_timers.hasOwnProperty(id)) {
          return _timers[id];
        } else {
          return false;
        }
      }
    }
  };
})(jQuery);
