"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCurrentEnv = exports.setupReactive = exports.setupWatch = exports.setupRef = exports.setupComputed = exports.Callable = exports.LazyHolder = exports.injectFacade = exports.provideDependency = exports.injectDependency = exports.CommonMixin = exports.provideFacade = exports.IFacade = exports.is = exports.assertMsg = exports.Arr = exports.Obj = exports.getOmitsBy = exports.Is = exports.addStringMappingFromNumEnum = exports.UnWrappedVueRef = exports.asUnWrappedVueRefMap = exports.flattenInstance = exports.getAccessibleProperties = exports.asEnum = exports.isRefImpl = exports.assert = exports.AssertionError = exports.AssertMsg = exports.UnExpectedError = exports.InvalidUsageError = exports.TypeMismatchError = exports.NotImplementedError = exports.UncaughtEnumType = exports.UnCaughtCondition = exports._watch = exports._reactive = exports._ref = exports._computed = void 0;
var extension_setup_1 = require("./extension/extension_setup");
Object.defineProperty(exports, "_computed", { enumerable: true, get: function () { return extension_setup_1._computed; } });
Object.defineProperty(exports, "_ref", { enumerable: true, get: function () { return extension_setup_1._ref; } });
Object.defineProperty(exports, "_reactive", { enumerable: true, get: function () { return extension_setup_1._reactive; } });
Object.defineProperty(exports, "_watch", { enumerable: true, get: function () { return extension_setup_1._watch; } });
/**
 *
 *      B A S E types
 *
 * */
var baseExceptions_1 = require("./base/baseExceptions");
Object.defineProperty(exports, "UnCaughtCondition", { enumerable: true, get: function () { return baseExceptions_1.UnCaughtCondition; } });
Object.defineProperty(exports, "UncaughtEnumType", { enumerable: true, get: function () { return baseExceptions_1.UncaughtEnumType; } });
Object.defineProperty(exports, "NotImplementedError", { enumerable: true, get: function () { return baseExceptions_1.NotImplementedError; } });
Object.defineProperty(exports, "TypeMismatchError", { enumerable: true, get: function () { return baseExceptions_1.TypeMismatchError; } });
Object.defineProperty(exports, "InvalidUsageError", { enumerable: true, get: function () { return baseExceptions_1.InvalidUsageError; } });
Object.defineProperty(exports, "UnExpectedError", { enumerable: true, get: function () { return baseExceptions_1.UnExpectedError; } });
/***
 *
 *    B A S E EXT
 *
 * */
var assert_1 = require("./utils/assert");
Object.defineProperty(exports, "AssertMsg", { enumerable: true, get: function () { return assert_1.AssertMsg; } });
Object.defineProperty(exports, "AssertionError", { enumerable: true, get: function () { return assert_1.AssertionError; } });
Object.defineProperty(exports, "assert", { enumerable: true, get: function () { return assert_1.assert; } });
var typeInference_1 = require("./utils/typeInference");
Object.defineProperty(exports, "isRefImpl", { enumerable: true, get: function () { return typeInference_1.isRefImpl; } });
Object.defineProperty(exports, "asEnum", { enumerable: true, get: function () { return typeInference_1.asEnum; } });
Object.defineProperty(exports, "getAccessibleProperties", { enumerable: true, get: function () { return typeInference_1.getAccessibleProperties; } });
Object.defineProperty(exports, "flattenInstance", { enumerable: true, get: function () { return typeInference_1.flattenInstance; } });
Object.defineProperty(exports, "asUnWrappedVueRefMap", { enumerable: true, get: function () { return typeInference_1.asUnWrappedVueRefMap; } });
Object.defineProperty(exports, "UnWrappedVueRef", { enumerable: true, get: function () { return typeInference_1.UnWrappedVueRef; } });
Object.defineProperty(exports, "addStringMappingFromNumEnum", { enumerable: true, get: function () { return typeInference_1.asMapFromNumberedEnum; } });
Object.defineProperty(exports, "Is", { enumerable: true, get: function () { return typeInference_1.Is; } });
Object.defineProperty(exports, "getOmitsBy", { enumerable: true, get: function () { return typeInference_1.getOmitsBy; } });
/**
 *
 *        C O R E
 *
 * */
var builtinTypes_1 = require("./base/builtinTypes");
Object.defineProperty(exports, "Obj", { enumerable: true, get: function () { return builtinTypes_1.Obj; } });
Object.defineProperty(exports, "Arr", { enumerable: true, get: function () { return builtinTypes_1.Arr; } });
var assert_2 = require("./utils/assert");
Object.defineProperty(exports, "assertMsg", { enumerable: true, get: function () { return assert_2.assertMsg; } });
var typeInference_2 = require("./utils/typeInference");
Object.defineProperty(exports, "is", { enumerable: true, get: function () { return typeInference_2.is; } });
var common_1 = require("./vueMixins/common");
Object.defineProperty(exports, "IFacade", { enumerable: true, get: function () { return common_1.IFacade; } });
Object.defineProperty(exports, "provideFacade", { enumerable: true, get: function () { return common_1.provideFacade; } });
Object.defineProperty(exports, "CommonMixin", { enumerable: true, get: function () { return common_1.CommonMixin; } });
Object.defineProperty(exports, "injectDependency", { enumerable: true, get: function () { return common_1.injectDependency; } });
Object.defineProperty(exports, "provideDependency", { enumerable: true, get: function () { return common_1.provideDependency; } });
Object.defineProperty(exports, "injectFacade", { enumerable: true, get: function () { return common_1.injectFacade; } });
var lazy_1 = require("./utils/lazy");
Object.defineProperty(exports, "LazyHolder", { enumerable: true, get: function () { return lazy_1.LazyHolder; } });
Object.defineProperty(exports, "Callable", { enumerable: true, get: function () { return lazy_1.CallableDelegate; } });
var extension_setup_2 = require("./extension/extension_setup");
Object.defineProperty(exports, "setupComputed", { enumerable: true, get: function () { return extension_setup_2.setupComputed; } });
Object.defineProperty(exports, "setupRef", { enumerable: true, get: function () { return extension_setup_2.setupRef; } });
Object.defineProperty(exports, "setupWatch", { enumerable: true, get: function () { return extension_setup_2.setupWatch; } });
Object.defineProperty(exports, "setupReactive", { enumerable: true, get: function () { return extension_setup_2.setupReactive; } });
Object.defineProperty(exports, "setupCurrentEnv", { enumerable: true, get: function () { return extension_setup_2.setupCurrentEnv; } });
//# sourceMappingURL=index.js.map