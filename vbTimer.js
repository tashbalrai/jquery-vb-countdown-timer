/*
A jQuery plugin to create timers using current time and the future date difference.
@author: Vipan Balrai


The MIT License (MIT)

Copyright (c) 2016 Vipan Balrai

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
;(function($) {
  var _timers = {};
  var _defaults = {
    prefix: 'vbTimer',
    level: 'days',
    delimiter: '<span class="cd-delimiter">:</span>',
    wrapper: {
      el: 'p',
      elClass: 'countdown'
    },
    years: {
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
    
    if (this._el.data('date-future')) {
      this._date = this._el.data('date-future');
    } else if (this._el.data('url')) {
      this._url = this._el.data('url');
    } else {
      throw new Error('Source date is required.');
    }
    
    if (this._el.data('date-now')) { 
      this._now = this._el.data('date-now');
    }
    
    this._evPool = {'start': [], 'stop': [], 'complete': []};
  };
  
  Timer.prototype.start = function (show) {
    this._show = show === 'show'? true: false;
    if (this._url) {
      $.ajax(this._url)
        .done(function (data, textStatus, jqXHR) {
          data = JSON.parse(data);
          if (data.current) {
            this._now = data.current;
          }
          this._date = data.expiry;
          this.init();
        }.bind(this))
        .fail(function (jqXHR, textStatus, errorThrown ) {
          throw errorThrown;
        }.bind(this));
    } else {
      this.init();
    }
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
  
  Timer.prototype.getDate = function (tillDate) {
    if (typeof tillDate === 'string') {
      return new Date(tillDate.replace(/-/ig,'/'));
    } else if (typeof tillDate === 'array' && tillDate.length >= 3) {
      var ds = '';
      for(var i=0; i<tillDate.length-1; i++) {
        ds = tillDate[i] + '-';
      }
      ds += tillDate[tillDate.length-1];
      return new Date(ds);
    } else {
      throw new Error('Date string of type "YYYY-MM-DD HH:MM:SS" or a Date array is required.');
    }
  };
  
  Timer.prototype.init = function () {
    if (this._now && this._now !== 'auto') {
      this._c = this.getDate(this._now);
    } else {
      this._c = new Date();
    }
    
    this._d = this.getDate(this._date);
    
    var d1, d2, diff, ts;

// d1 = new Date('2015/04/29 10:06:00');
// d2 = new Date('2016/04/29 12:36:37');

// diff = d2 - d1;

// ts = Math.floor(diff/1000);
// console.log('Total Psecs: ', ts%60);
// tm = Math.floor(ts/60);
// console.log('Total Pmins: ', tm%60);
// th = Math.floor(tm/60);
// console.log('Total Phours: ', th%24);
// td = Math.floor(th/24);
// console.log('Total Pdays: ', td%30);
// tmon = Math.floor(td/30);
// console.log('Total Pmons: ', tmon%30);
// ty = Math.floor(tmon/12);
// console.log('Total Pyears: ', ty%12);
    
    this._ms = this._d - this._c;
    this._th = this._ms / 3600000;
    this._tm = this._th * 60;
    this._ts = this._tm * 60;
    this._td = Math.floor(this._th / 24);
    this._ty = Math.floor(this._td / 365);
    
    console.log(this._ms / 1000, this._ms % 1000);
    
    this._pd = Math.floor(this._th / 24);
    this._ph = Math.floor(this._th % 24);
    this._pm = Math.floor(this._tm % 60);
    this._ps = Math.floor(this._ts % 60);
    this._pms = Math.floor((this._ts * 1000) % 1000);
    
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
        this.completed();
      } else {
        this._show && this._el.html(this.getHtml());
      }
    }.bind(this), 1000);
  };
  
  Timer.prototype.completed = function () {
    for(var i=0, len = this._evPool.complete.length; i<len; i++) {
      setTimeout(this._evPool.complete[i], 0);
    }
  };
  
  Timer.prototype.started = function () {
    for(var i=0, len = this._evPool.start.length; i<len; i++) {
      setTimeout(this._evPool.start[i], 0);
    }
  };
  
  Timer.prototype.stopped = function () {
    for(var i=0, len = this._evPool.stop.length; i<len; i++) {
      setTimeout(this._evPool.stop[i], 0);
    }
  };
  
  Timer.prototype.on = function (ev, cb) {
    ev = ev.toLowerCase();
    if (this._evPool.hasOwnProperty(ev)) {
      this._evPool[ev].push(cb);
    }
    console.log(this._evPool);
  }
  
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