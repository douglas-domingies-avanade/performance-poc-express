import * as faker from 'faker';
export default abstract class BaseRepository<T> {
    private _parameters: any;
    private _crudAttached = false;
    protected constructor(parameters: any) {
        this._parameters = parameters;
        Object.seal(this._parameters);
    }
    get parameters() {
        return this._parameters;
    }
    abstract insert(data: any): any;
    abstract updateOne(id: any, data: any): any;
    abstract findAll(): any;
    abstract findOne(id: any): any;
    abstract deleteAll(): any;
    abstract deleteOne(id: any): { status: number };
    attachCRUDRoutes(app: any, route?: string) {
        if (this._crudAttached) throw new Error('Repository already attached!');
        app.post(route || this.parameters.route, (req: any, res: any) => {
            if (req.headers['x-random-name'] == '1') {
                req.body.nome = faker.name.firstName();
            }
            const result = this.insert(req.body);
            res.status(result.status)
            res.send({ id: result.insertedId });
        });
        app.get(route || this.parameters.route, (req: any, res: any) => {
            const result = this.findAll();
            res.status(result.status)
            res[typeof res.json === 'function' ? 'json' : 'send'](result.data);
        });
        app.get(`${route || this.parameters.route}/:id`, (req: any, res: any) => {
            const result = this.findOne(req.params.id);
            res.status(result.status)
            res[typeof res.json === 'function' ? 'json' : 'send'](result.data);
        });
        app.put(`${route || this.parameters.route}/:id`, (req: any, res: any) => {
            const result = this.updateOne(req.params.id, req.body);
            res.status(result.status)
            res.send('');
        });
        app.delete(`${route || this.parameters.route}/:id`, (req: any, res: any) => {
            const result = this.deleteOne(req.params.id);
            res.status(result.status)
            res.send('');
        });
        return this;
    }
}

export class MemoryRepo<T> extends BaseRepository<T> {
    private _data = Array();
    private _byId = {} as any;
    private _id = 1;
    constructor(parameters: any) {
        super(parameters)
        //super(parameters);

    }
    attachCRUDRoutes(app: any, route?: string | undefined): this {
        BaseRepository.prototype.attachCRUDRoutes.apply(this, [app, route]);
        return this;
    }
    insert(data: any) {
        data.id = this._id++;
        this._byId[data.id] = data;
        this._data.push(data);
        //console.log(this, data);
        return { status: 201, insertedId: data.id };
    }
    updateOne(id: any, data: any) {
        const _internal = this._byId[id];
        if (!_internal) {
            return { status: 404 };
        }
        const index = this._data.findIndex((u) => u.id === _internal.id);
        if (index === -1) {
            return { status: 404 };
        }
        delete data.id;
        Object.assign(this._byId[id], data);
        return { status: 204 }
    }
    findAll() {
        return { status: 200, data: this._data };
    }
    findOne(id: any) {
        const data = this._byId[id];
        if (!data) {
            return { status: 404 };
        }
        const index = this._data.findIndex((u) => u.id === data.id);
        if (index === -1) {
            return { status: 404 };
        }
        return { status: 200, data };
    }
    deleteAll() {
        this._data.splice(0, this._data.length);
        return { status: 204 };
    }
    deleteOne(id: any) {
        const _internal = this._byId[id];
        if (!_internal) {
            return { status: 404 };
        }
        const index = this._data.findIndex((u) => u.id === _internal.id);
        if (index === -1) {
            return { status: 404 };
        }
        delete this._byId[id];
        this._data.splice(index, 1);
        return { status: 204 };
    }
}