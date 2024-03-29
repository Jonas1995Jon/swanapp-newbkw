!function () {
  "use strict";
  var c = "1.4.3",
      a = { ns: null, boxjs: null },
      i = {},
      u = {},
      f = { logServerUrl: "https://hmma.baidu.com/mini.gif", maxRequestRetryCount: 5, requestRetryFirstDelay: 1e3, requestRetryMultiple: 4, maxRequestDataLength: 204800, maxUint8: 255, maxUint32: 4294967295, enabledEvents: { app: ["show", "hide", "error"], page: ["show", "hide", "ready"], share: ["action", "success", "fail"], event: "*" }, storageKeys: { appId: "mtj_appid", key: "mtj_key", uuid: "mtj_uuid", shareCount: "mtj_scnt" } },
      o = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
    return typeof e;
  } : function (e) {
    return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  },
      l = function (e, t) {
    if (Array.isArray(e)) return e;if (Symbol.iterator in Object(e)) return function (e, t) {
      var n = [],
          r = !0,
          a = !1,
          o = void 0;try {
        for (var s, c = e[Symbol.iterator](); !(r = (s = c.next()).done) && (n.push(s.value), !t || n.length !== t); r = !0);
      } catch (e) {
        a = !0, o = e;
      } finally {
        try {
          !r && c.return && c.return();
        } finally {
          if (a) throw o;
        }
      }return n;
    }(e, t);throw new TypeError("Invalid attempt to destructure non-iterable instance");
  },
      r = function () {
    return "undefined" != typeof crypto && crypto.getRandomValues ? crypto.getRandomValues(new Uint32Array(1))[0] : Math.floor(Math.random() * f.maxUint32);
  },
      s = function (e, t) {
    return "[object " + t + "]" === {}.toString.call(e);
  },
      h = function n(r) {
    return (s(r, "Object") || s(r, "Array")) && Object.keys(r).forEach(function (e) {
      var t = r[e];s(t, "Object") || s(t, "Array") ? r[e] = n(t) : r[e] = "" + t;
    }), r;
  },
      p = new Set(),
      d = [],
      n = 0,
      t = function (e) {
    if (e.data = e.data || {}, e.data.v = c, e.data.rqc = ++n, t = e.data, !(JSON.stringify(t).length <= f.maxRequestDataLength)) return n--, void (e.fail && e.fail(new Error("invalid data")));var t;!function t(n) {
      var r = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : f.requestRetryFirstDelay;return a.ns.request({ url: n.url, data: n.data, header: Object.assign({ "content-type": "application/json" }, n.header), method: n.method || "POST", dataType: n.dataType || "json", success: function (e) {
          delete n.data.rtc, n.success && n.success(e);
        }, fail: function (e) {
          n.data.rtc = (n.data.rtc || 0) + 1, n.data.rtc <= f.maxRequestRetryCount ? setTimeout(function () {
            return t(n, r * f.requestRetryMultiple);
          }, r) : (delete n.data.rtc, n.fail && n.fail(e));
        } });
    }(e);
  },
      y = function () {
    return p.has("app.launch") && p.has("app.show");
  },
      g = function () {
    d.forEach(function (e) {
      e.data = Object.assign({}, i, e.data), "show" !== e.data.en && "share" !== e.data.et && "event" !== e.data.et || Object.assign(e.data, u), t(e);
    }), d.length = 0;
  },
      m = { sendRequest: t, trackEvent: function (e) {
      var t = this;if (p.add(e.et + "." + e.en), "app" === e.et && "launch" === e.en && y() && g(), "*" === f.enabledEvents[e.et] || -1 !== f.enabledEvents[e.et].indexOf(e.en)) {
        e.rid = r(), e.aso = e.aso || {};var n = { url: f.logServerUrl, dataType: "string", data: Object.assign({}, i, e), fail: function (e) {
            return t.trackError("sendRequest", e);
          } };y() ? (this.sendRequest(n), "app" === e.et && "show" === e.en && g()) : (i.path && (n.data.path = i.path), i.query && (n.data.query = i.query), "app" === e.et && "show" === e.en ? d.unshift(n) : d.push(n));
      }
    }, trackError: function (e, t) {
      var n = s(t, "Object") ? JSON.stringify(h(t)) : "" + t;this.sendRequest({ url: f.logServerUrl, dataType: "string", data: Object.assign({}, i, { et: "error", en: e, ep: { ex: n }, rid: r() }) });
    }, clearTrackedEvents: function () {
      p.clear();
    }, ubcLog: function (e) {
      a.boxjs.boxjs.log({ name: "ubcFlowJar", data: [e] });
    } },
      v = function (e) {
    try {
      return a.ns.getStorageSync(e);
    } catch (e) {
      m.trackError("getStorageSync", e);
    }
  },
      S = function (e, t) {
    try {
      a.ns.setStorageSync(e, t);
    } catch (e) {
      m.trackError("setStorageSync", e);
    }
  },
      b = function () {
    return Promise.resolve().then(function () {
      return new Promise(function (e, t) {
        var n = v(f.storageKeys.uuid);if (s(n, "String") && 32 === n.length) return e(n);n = ([1e7] + 1e3 + 4e3 + 8e3 + 1e11).replace(/[018]/g, function (e) {
          return (e ^ ("undefined" != typeof crypto && crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(1))[0] : Math.floor(Math.random() * f.maxUint8)) & 15 >> e / 4).toString(16);
        }), S(f.storageKeys.uuid, n), e(n);
      });
    });
  },
      k = function (n) {
    return Promise.resolve().then(function () {
      return new Promise(function (t, e) {
        if (!n) return t();try {
          a.ns.getShareInfo({ shareTicket: n, success: function (e) {
              delete e.errMsg, t(e);
            }, fail: function (e) {
              t({});
            } });
        } catch (e) {
          m.trackError("getShareInfo", e), t({});
        }
      });
    });
  },
      w = { onLaunch: function () {
      var e = require("./mtj-wx-sdk.config");return e.appKey ? (i.key = e.appKey, Promise.all([b(), Promise.resolve().then(function () {
        return new Promise(function (t, e) {
          try {
            a.ns.getSetting({ success: function (e) {
                e.authSetting && e.authSetting["scope.userInfo"] ? a.ns.checkSession({ success: function (e) {
                    e && !1 === e.result ? t({}) : a.ns.getUserInfo({ success: function (e) {
                        delete e.userInfo.errMsg, t(e.userInfo);
                      }, fail: function () {
                        t({});
                      } });
                  }, fail: function () {
                    t({});
                  } }) : t({});
              }, fail: function () {
                t({});
              } });
          } catch (e) {
            m.trackError("getUserInfo", e), t({});
          }
        });
      }), Promise.resolve().then(function () {
        return new Promise(function (t, e) {
          try {
            a.ns.getSystemInfo({ success: function (e) {
                delete e.errMsg, t(e);
              }, fail: function (e) {
                t({});
              } });
          } catch (e) {
            m.trackError("getSystemInfo", e), t({});
          }
        });
      }), Promise.resolve().then(function () {
        return new Promise(function (t, e) {
          try {
            a.ns.getNetworkType({ success: function (e) {
                delete e.errMsg, t(e);
              }, fail: function (e) {
                t({});
              } });
          } catch (e) {
            m.trackError("getNetworkType", e), t({});
          }
        });
      }), e.getLocation ? Promise.resolve().then(function () {
        return new Promise(function (t, e) {
          try {
            a.ns.getLocation({ type: "wgs84", success: function (e) {
                delete e.errMsg, t(e);
              }, fail: function (e) {
                t({});
              } });
          } catch (e) {
            m.trackError("getLocation", e), t({});
          }
        });
      }) : Promise.resolve()]).then(function (e) {
        var t = l(e, 5),
            n = t[0],
            r = t[1],
            a = t[2],
            o = t[3],
            s = t[4];i.uuid = n, u.user = h(r), u.system = h(a), u.network = h(o), s && (u.location = h(s)), "devtools" === a.platform && f.latestVersion && function (e, t) {
          for (var n = e.split("."), r = t.split("."), a = 0; a < 3; a++) {
            var o = +n[a] || 0,
                s = +r[a] || 0;if (s < o) return 1;if (o < s) return -1;
          }return 0;
        }(c, f.latestVersion) < 0 && console.warn("百度移动统计微信小程序SDK已更新，为不影响您的正常使用，请到SDK下载中心（https://mtj.baidu.com/web/sdk/index）下载最新版本"), m.trackEvent({ et: "app", en: "launch" });
      }).catch(function (e) {
        return m.trackError("app onLaunch", e);
      })) : (console.error("请设置mtj-wx-sdk.config.js文件中的appKey字段"), Promise.resolve());
    }, onShow: function () {
      var t = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {};return u.aso = u.aso || {}, (s(i.sid, "Undefined") || t.scene && u.aso.scene !== "" + t.scene) && (i.sid = r(), i.rqc = 0), u.aso.scene = "" + (t.scene || ""), t.referrerInfo && t.referrerInfo.appId ? u.aso.referrerInfo = t.referrerInfo : delete u.aso.referrerInfo, i.path = u.aso.path = t.path || "", i.query = u.aso.query = Object.keys(t.query || {}).map(function (e) {
        return { key: e, value: t.query[e] };
      }), k(t.shareTicket).then(function (e) {
        e ? u.aso.shareInfo = e : delete u.aso.shareInfo, m.trackEvent(Object.assign({ et: "app", en: "show" }, u));
      });
    }, onHide: function () {
      m.trackEvent({ et: "app", en: "hide" });
    }, onError: function (e) {
      var t = s(e, "Object") ? JSON.stringify(h(e)) : "" + e;m.trackEvent({ et: "app", en: "error", ep: { ex: t } });
    } },
      E = function (e, t) {
    m.trackEvent({ et: "page", en: e, ep: t });
  },
      j = { onLoad: function () {
      E("load");
    }, onShow: function () {
      var e = getCurrentPages(),
          t = e[e.length - 1];i.path = t.route, i.query = Object.keys(t.options).map(function (e) {
        return { key: e, value: t.options[e] };
      }), m.trackEvent(Object.assign({ et: "page", en: "show" }, u));
    }, onReady: function () {
      E("ready");
    }, onHide: function () {
      E("hide");
    }, onUnload: function () {
      E("unload");
    }, onPullDownRefresh: function () {
      E("pullDownRefresh");
    }, onReachBottom: function () {
      E("reachBottom");
    }, onPageScroll: function () {
      E("pageScroll");
    }, onTabItemTap: function (e) {
      E("tabItemTap", e);
    }, onShareAppMessage: function (e) {
      var t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {},
          n = v(f.storageKeys.shareCount);n = (Number.isInteger(n) ? n : 0) + 1, S(f.storageKeys.shareCount, n);var r = { cnt: n, from: e.from, path: t.path || "" };t.title && (r.title = "" + t.title), e.target && (r.target = JSON.stringify(e.target)), m.trackEvent(Object.assign({ et: "share", en: "action", ep: r }, u));var a = t.success;t.success = function (e) {
        j.shareSuccess(e), a && a(e);
      };var o = t.fail;return t.fail = function (e) {
        j.shareFail(e), o && o(e);
      }, t;
    }, shareSuccess: function () {
      var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : {},
          t = [].concat(e.shareTickets);Promise.all(t.map(function (e) {
        return k(e);
      })).then(function (e) {
        e && e[0] || (e = []), m.trackEvent({ et: "share", en: "success", ep: { shareInfo: e } });
      });
    }, shareFail: function (e) {
      m.trackEvent({ et: "share", en: "fail", ep: { ex: JSON.stringify(e) } });
    } },
      O = function (e) {
    if (t = e.reportName, s(t, "String") && /^[a-z][a-z0-9_]{0,31}$/.test(t)) {
      var t,
          r = e.reportParams || {},
          n = Object.keys(r).filter(function (e) {
        return s(n = e, "String") && /^[a-z0-9_]{1,32}$/.test(n) && (t = r[e], s(t, "String") || s(t, "Number"));var t, n;
      }).map(function (e) {
        return { key: "" + e, value: "" + r[e], type: o(r[e]) };
      });m.trackEvent(Object.assign({ et: "event", en: "" + e.reportName, ep: { data: n } }, u));
    }
  },
      q = function (e, t, n) {
    var r = t[e];t[e] = function (e) {
      n.call(this, e), r && r.call(this, e);
    };
  };!function () {
    i.type = 1, a.ns = swan;var e = App;App = function (t) {
      ["onLaunch", "onShow", "onHide", "onError"].forEach(function (e) {
        q(e, t, w[e]);
      }), t.mtj = { trackEvent: function (e, t) {
          O({ reportName: e, reportParams: t });
        } }, e(t);
    };var t = Page;Page = function (o) {
      ["onLoad", "onShow", "onHide", "onReady"].forEach(function (e) {
        q(e, o, j[e]);
      }), ["onShareAppMessage"].forEach(function (e) {
        var t, n, r, a;n = o, r = j[t = e], a = n[t], n[t] = function (e) {
          var t = a && a.call(this, e);return r.call(this, e, t);
        };
      }), t(o);
    };
  }();
}();