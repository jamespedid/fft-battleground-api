"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const axios_1 = __importDefault(require("axios"));
class Client {
    constructor() {
        this.axios = axios_1.default.create({
            baseURL: 'https://fftbg.com',
            validateStatus: status => status >= 200 && status < 300 || status === 404,
        });
        this.tournaments = new Tournaments(this);
        this.champions = new Champions(this);
        this.tips = new Tips(this);
    }
}
exports.Client = Client;
const nextLinkRegexp = /^<(.+)>; rel="next"$/;
class Tournaments {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    latest({ totalPages = undefined, limit = 50, before = undefined, filter = undefined, }) {
        return __asyncGenerator(this, arguments, function* latest_1() {
            totalPages = totalPages !== null && totalPages !== void 0 ? totalPages : Infinity;
            let pageCount = 0;
            let more = false;
            let params = {
                limit,
                before,
                filter,
            };
            do {
                const response = yield __await(this.apiClient.axios.get('/api/tournaments', {
                    params,
                }));
                for (const record of response.data) {
                    yield yield __await(record);
                }
                pageCount += 1;
                if (pageCount >= totalPages) {
                    more = false;
                    break;
                }
                const { link } = response.headers;
                if (link) {
                    let match = link.match(nextLinkRegexp);
                    if (!match) {
                        more = false;
                        break;
                    }
                    const url = new URL(match[1]);
                    if (url.searchParams.has('limit')) {
                        params.limit = Number(url.searchParams.get('limit'));
                    }
                    if (url.searchParams.has('before')) {
                        params.before = Number(url.searchParams.get('before'));
                    }
                    if (url.searchParams.has('filter')) {
                        params.filter = url.searchParams.get('filter');
                    }
                    more = true;
                }
                else {
                    more = false;
                }
            } while (more);
        });
    }
    byId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.apiClient.axios.get(`/api/tournament/${id}`);
            if (response.status === 404) {
                return null;
            }
            return response.data;
        });
    }
}
class Champions {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    query({ totalPages = undefined, season, sort, limit, after, }) {
        var _a;
        return __asyncGenerator(this, arguments, function* query_1() {
            totalPages = totalPages !== null && totalPages !== void 0 ? totalPages : Infinity;
            let pageCount = 0;
            const params = {
                sort,
                limit,
                after,
            };
            let more = false;
            const targetUrl = season ? `/api/champions/${season}` : '/api/champions';
            do {
                const response = yield __await(this.apiClient.axios.get(targetUrl, {
                    params,
                }));
                for (const championData of response.data) {
                    yield yield __await(championData);
                }
                pageCount += 1;
                if (pageCount >= totalPages) {
                    more = false;
                    break;
                }
                const { link } = response.headers;
                if (link) {
                    let match = link.match(nextLinkRegexp);
                    if (!match) {
                        more = false;
                        break;
                    }
                    const url = new URL(match[1]);
                    if (url.searchParams.has('limit')) {
                        params.limit = Number(url.searchParams.get('limit'));
                    }
                    if (url.searchParams.has('after')) {
                        params.after = Number(url.searchParams.get('after'));
                    }
                    if (url.searchParams.has('filter')) {
                        params.sort = (_a = url.searchParams.get('sort')) !== null && _a !== void 0 ? _a : 'rank';
                    }
                    more = true;
                }
                else {
                    more = false;
                }
            } while (more);
        });
    }
    byRank(params) {
        params.sort = 'rank';
        return this.query(params);
    }
    latest(params) {
        params.sort = 'latest';
        return this.query(params);
    }
    byId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.apiClient.axios.get(`/api/champion/${id}`);
            if (response.status === 404) {
                return null;
            }
            return response.data;
        });
    }
}
class Tips {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    getTipData() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.apiClient.axios.get(`/api/tips`);
            if (response.status === 404) {
                throw new Error('could not retrieve all tip data');
            }
            return response.data;
        });
    }
}
