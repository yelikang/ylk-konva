import { Node } from './Node';
import { Util } from './Util';
import { getComponentValidator } from './Validators';

var GET = 'get',
  SET = 'set';

export const Factory = {
  addGetterSetter(constructor, attr, def?, validator?, after?) {
    Factory.addGetter(constructor, attr, def);
    Factory.addSetter(constructor, attr, validator, after);
    Factory.addOverloadedGetterSetter(constructor, attr);
  },
  addGetter(constructor, attr, def?) {
    var method = GET + Util._capitalize(attr);
    // 原型链上有没有对应的getXXX方法(例如getZIndex)，没有就赋值一个，并从attrs属性上获取，attr没有就去def传入的默认值
    // addGetterSetter(Node, 'width', 0, getNumberValidator()); 
    // 之后,就可以通过addOverloadedGetterSetter 中的 node.width() => addGetter 中的 node.getWidth() => this.attrs[width] 获取节点属性值
    // 并且set属性值的时候，会调用getNumberValidator()这个validator校验方法，在addSetter时进行校验
    constructor.prototype[method] =
      constructor.prototype[method] ||
      function (this: Node) {
        var val = this.attrs[attr];
        return val === undefined ? def : val;
      };
  },

  addSetter(constructor, attr, validator?, after?) {
    var method = SET + Util._capitalize(attr);

    if (!constructor.prototype[method]) {
      Factory.overWriteSetter(constructor, attr, validator, after);
    }
  },
  overWriteSetter(constructor, attr, validator?, after?) {
    var method = SET + Util._capitalize(attr);
    constructor.prototype[method] = function (val) {
      if (validator && val !== undefined && val !== null) {
        val = validator.call(this, val, attr);
      }

      this._setAttr(attr, val);

      if (after) {
        after.call(this);
      }

      return this;
    };
  },
  addComponentsGetterSetter(
    constructor,
    attr: string,
    components: Array<string>,
    validator?: Function,
    after?: Function
  ) {
    var len = components.length,
      capitalize = Util._capitalize,
      getter = GET + capitalize(attr),
      setter = SET + capitalize(attr),
      n,
      component;

    // getter
    constructor.prototype[getter] = function () {
      var ret = {};

      for (n = 0; n < len; n++) {
        component = components[n];
        ret[component] = this.getAttr(attr + capitalize(component));
      }

      return ret;
    };

    var basicValidator = getComponentValidator(components);

    // setter
    constructor.prototype[setter] = function (val) {
      var oldVal = this.attrs[attr],
        key;

      if (validator) {
        val = validator.call(this, val);
      }

      if (basicValidator) {
        basicValidator.call(this, val, attr);
      }

      for (key in val) {
        if (!val.hasOwnProperty(key)) {
          continue;
        }
        this._setAttr(attr + capitalize(key), val[key]);
      }
      if (!val) {
        components.forEach((component) => {
          this._setAttr(attr + capitalize(component), undefined);
        });
      }

      this._fireChangeEvent(attr, oldVal, val);

      if (after) {
        after.call(this);
      }

      return this;
    };

    Factory.addOverloadedGetterSetter(constructor, attr);
  },
  /**
   * 构造函数原型链上添加属性方法,例如node.zIndex属性，会指向node.getZIndex；相当于快捷操作
   * @param constructor 
   * @param attr 
   */
  addOverloadedGetterSetter(constructor, attr) {
    var capitalizedAttr = Util._capitalize(attr),
      setter = SET + capitalizedAttr,
      getter = GET + capitalizedAttr;

    constructor.prototype[attr] = function () {
      // setting 如果有参数就是set，例如 node.zIndex(1)
      if (arguments.length) {
        this[setter](arguments[0]);
        return this;
      }
      // getting 如果没参数就是get，例如 node.zIndex()
      return this[getter]();
    };
  },
  addDeprecatedGetterSetter(constructor, attr, def, validator) {
    Util.error('Adding deprecated ' + attr);

    var method = GET + Util._capitalize(attr);

    var message =
      attr +
      ' property is deprecated and will be removed soon. Look at Konva change log for more information.';
    constructor.prototype[method] = function () {
      Util.error(message);
      var val = this.attrs[attr];
      return val === undefined ? def : val;
    };
    Factory.addSetter(constructor, attr, validator, function () {
      Util.error(message);
    });
    Factory.addOverloadedGetterSetter(constructor, attr);
  },
  backCompat(constructor, methods) {
    Util.each(methods, function (oldMethodName, newMethodName) {
      var method = constructor.prototype[newMethodName];
      var oldGetter = GET + Util._capitalize(oldMethodName);
      var oldSetter = SET + Util._capitalize(oldMethodName);

      function deprecated(this: Node) {
        method.apply(this, arguments);
        Util.error(
          '"' +
            oldMethodName +
            '" method is deprecated and will be removed soon. Use ""' +
            newMethodName +
            '" instead.'
        );
      }

      constructor.prototype[oldMethodName] = deprecated;
      constructor.prototype[oldGetter] = deprecated;
      constructor.prototype[oldSetter] = deprecated;
    });
  },
  afterSetFilter(this: Node) {
    this._filterUpToDate = false;
  },
};
