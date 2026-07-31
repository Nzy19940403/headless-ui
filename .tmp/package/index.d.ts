import * as _meshflow_core from '@meshflow/core';
import { MeshPath, useScheduler, SchemaBucket, MeshEvents, Engine, SchedulerType, InferLeafType, InferLeafPath } from '@meshflow/core';
export { GhostProposalApi, MeshNodeProxy, SetRuleOptions } from '@meshflow/core';

type FinalFlatten<T> = T extends infer O ? {
    [K in keyof O]: O[K];
} : never;
type BaseField$1 = {
    label: string;
    name: string;
    placeholder?: string;
    disabled: boolean;
    readonly: boolean;
    hidden?: boolean;
    validators?: any;
    theme?: string;
};
type InputField$1 = BaseField$1 & {
    type: "input" | "number";
    required: boolean;
    min?: number;
    maxLength: number;
    value: string | number;
};
type CheckboxField$1 = BaseField$1 & {
    type: "checkbox";
    description?: string;
    required: boolean;
    value: boolean;
};
type SelectField$1 = BaseField$1 & {
    type: "select";
    required: boolean;
    options: {
        label: string;
        value: any;
    }[];
    value: any;
};
type GroupField$1 = Omit<BaseField$1, "label" | "name" | "placeholder" | "validators"> & {
    type: "group";
    name?: string;
    children: FormFieldSchema$1[];
};
type FormFieldSchema$1 = InputField$1 | CheckboxField$1 | SelectField$1 | GroupField$1;
type RenderSchemaExtraCommonType$1<P = any> = {
    path: P;
    dirtySignal: any;
    uid: number;
    nodeBucket: Record<string, SchemaBucket<P>>;
    dependOn: (cb: (...args: any) => void) => void;
};
type RenderSchemaFn$1<T> = FinalFlatten<T extends GroupField$1 ? Omit<T, "children"> & RenderSchemaExtraCommonType$1 & {
    children: Array<RenderSchemaFn$1<FormFieldSchema$1>>;
} : T & RenderSchemaExtraCommonType$1>;
type RenderSchema$1 = RenderSchemaFn$1<FormFieldSchema$1>;
declare function useInternalForm<T, P extends MeshPath>(scheduler: ReturnType<typeof useScheduler<T, P>>, rootSchema: any): {
    uiSchema: RenderSchema$1;
    GetFormData: () => any;
};

declare const useSchemaValidators: <P extends MeshPath>(Finder: (path: P) => any) => {
    SetValidators: (path: P, options: {
        logic: (val: any, GetByPath: any) => any;
        condition: (data: any) => boolean;
    }) => void;
};

type NodeStatus = 'idle' | 'pending' | 'calculating' | 'calculated' | 'error' | 'canceled';
declare function useExecutionTrace<P>(): {
    SetTrace: (myPath: P, onUpdate: (newStatus: NodeStatus) => void) => {
        cancel: () => void;
    };
    useTrace: () => {
        apply: (api: {
            on: (event: keyof MeshEvents, cb: (data: any) => void) => void;
        }) => void;
    };
};

type MeshWidgetType = 'input' | 'number' | 'select' | 'checkbox' | (string & {});
interface MeshFieldSchema {
    type: 'string' | 'number' | 'boolean' | 'integer';
    title?: string;
    description?: string;
    default?: any;
    enum?: any[];
    'x-widget'?: MeshWidgetType;
    'x-placeholder'?: string;
    'x-options'?: {
        label: string;
        value: any;
    }[];
    'x-required'?: boolean;
    'x-disabled'?: boolean;
    'x-hidden'?: boolean;
    'x-readonly'?: boolean;
    'x-theme'?: string;
    'x-min'?: number;
    'x-maxLength'?: number;
    [key: `x-${string}`]: any;
}
interface MeshObjectSchema {
    type: 'object';
    title?: string;
    description?: string;
    properties: Record<string, MeshFieldSchema | MeshObjectSchema>;
    'x-order'?: string[];
    'x-layout'?: 'vertical' | 'horizontal';
}
type MeshFormSchema = MeshObjectSchema;

type FormItemValidationFn = (value: any) => boolean | string;
type FormItemValidationFns = readonly FormItemValidationFn[];
type BaseField = {
    label: string;
    name: string;
    placeholder?: string;
    disabled: boolean;
    readonly: boolean;
    hidden?: boolean;
    validators?: any;
    theme?: string;
};
type InputField = BaseField & {
    type: "input" | "number";
    required: boolean;
    min?: number;
    maxLength: number;
    value: string | number;
};
type CheckboxField = BaseField & {
    type: "checkbox";
    description?: string;
    required: boolean;
    value: boolean;
};
type SelectField = BaseField & {
    type: "select";
    required: boolean;
    options: {
        label: string;
        value: any;
    }[];
    value: any;
};
type GroupField = Omit<BaseField, "label" | "name" | "placeholder" | "validators"> & {
    type: "group";
    name?: string;
    children: FormFieldSchema[];
};
type FormFieldSchema = InputField | CheckboxField | SelectField | GroupField;
type RenderSchemaExtraCommonType<P = any> = {
    path: P;
    dirtySignal: any;
    uid: number;
    nodeBucket: Record<string, SchemaBucket<P>>;
    dependOn: (cb: (...args: any) => void) => void;
};
type RenderSchemaFn<T> = FinalFlatten<T extends GroupField ? Omit<T, "children"> & RenderSchemaExtraCommonType & {
    children: Array<RenderSchemaFn<FormFieldSchema>>;
} : T & RenderSchemaExtraCommonType>;
type RenderSchema = RenderSchemaFn<FormFieldSchema>;
type CollapseChildren<T> = T extends readonly [infer First, ...infer Rest] ? FormResultType<First> & CollapseChildren<Rest> : {};
type FormResultType<T> = T extends any ? T extends {
    readonly type: "group";
    readonly name: infer N;
    readonly children: infer C;
} ? N extends string ? N extends "" ? FinalFlatten<CollapseChildren<C>> : {
    [K in N]: FinalFlatten<CollapseChildren<C>>;
} : FinalFlatten<CollapseChildren<C>> : T extends {
    readonly name: infer N;
    readonly value: infer V;
} ? N extends string ? {
    [K in N]: FinalFlatten<V>;
} : never : {} : {};

type FromDescriptor = {
    _isMeshFrom: true;
    source: string | string[];
    logic: (...values: any[]) => any;
    triggerKeys?: string[];
    effect?: (args: any) => any;
    effectArgs?: string[];
};
declare function from(source: string | string[], logic: (...values: any[]) => any, options?: Pick<FromDescriptor, 'triggerKeys' | 'effect' | 'effectArgs'>): FromDescriptor;
type MeshGraph = {
    upstream: (path: string) => string[];
    downstream: (path: string) => string[];
    directUpstream: (path: string) => string[];
    directDownstream: (path: string) => string[];
    order: () => string[][];
};
type NormalizeFormSchema<T> = T extends Function ? T : T extends readonly any[] ? {
    -readonly [K in keyof T]: NormalizeFormSchema<T[K]>;
} : T extends object ? {
    -readonly [K in keyof T as K extends 'name' ? 'name' | 'path' : K]: NormalizeFormSchema<T[K]>;
} : T;
type tracePlugin<P> = ReturnType<typeof useExecutionTrace<P>>;
declare function useMeshForm<const S extends Record<string, any>, NM extends Record<string, any> = InferLeafType<NormalizeFormSchema<S>>, M extends Record<string, any> = {}, T = any, P extends MeshPath = [InferLeafPath<NormalizeFormSchema<S>>] extends [never] ? MeshPath : InferLeafPath<NormalizeFormSchema<S>> | (string & {})>(id: string, schema: S, options: {
    UITrigger: {
        signalCreator: () => T;
        signalTrigger: (signal: T) => void;
    };
    modules?: M;
    config?: {
        useGreedy?: boolean;
    };
    metaType?: NM;
}): _meshflow_core.BaseEngine<SchedulerType<T, P, S, M, NM>> & {
    modules: _meshflow_core.EngineModules<M & {
        internalModules: {
            internalForm: typeof useInternalForm;
            schemaValidators: typeof useSchemaValidators;
        };
    }, P>;
} & {
    plugins: {
        SetTrace: tracePlugin<P>["SetTrace"];
    };
    define: (rules: Record<string, FromDescriptor>) => void;
    graph: MeshGraph;
    /** raw meshflow: engine.setRule(source, target, key, options) */
    setRule: (...args: any[]) => void;
    /** raw meshflow: engine.setRules(sources, target, key, options) */
    setRules: (...args: any[]) => void;
    /** raw meshflow: engine.entangle(paths, options) - cyclic/bidirectional graph */
    entangle: (...args: any[]) => any;
};
declare const useEngine: <M extends Record<string, any>, P extends MeshPath = MeshPath, NM extends Record<string, any> = Record<string, any>>(id: MeshPath) => Engine<SchedulerType<any, P, any, M & {
    internalModules: {
        internalForm: typeof useInternalForm;
        schemaValidators: typeof useSchemaValidators;
    };
}, NM>, M & {
    internalModules: {
        internalForm: typeof useInternalForm;
        schemaValidators: typeof useSchemaValidators;
    };
}, P> & {
    plugins: {
        SetTrace: tracePlugin<P>["SetTrace"];
    };
};
declare const deleteEngine: (id: MeshPath) => void;
declare function useMeshFormJson<T = any, M extends Record<string, any> = {}>(id: string, jsonSchema: MeshFormSchema, options: {
    UITrigger: {
        signalCreator: () => T;
        signalTrigger: (signal: T) => void;
    };
    modules?: M;
    config?: {
        useGreedy?: boolean;
    };
}): _meshflow_core.BaseEngine<SchedulerType<T, MeshPath, GroupField$1, M, never>> & {
    modules: _meshflow_core.EngineModules<M & {
        internalModules: {
            internalForm: typeof useInternalForm;
            schemaValidators: typeof useSchemaValidators;
        };
    }, MeshPath>;
} & {
    plugins: {
        SetTrace: (myPath: MeshPath, onUpdate: (newStatus: "idle" | "pending" | "calculating" | "calculated" | "error" | "canceled") => void) => {
            cancel: () => void;
        };
    };
    define: (rules: Record<string, FromDescriptor>) => void;
    graph: MeshGraph;
    /** raw meshflow: engine.setRule(source, target, key, options) */
    setRule: (...args: any[]) => void;
    /** raw meshflow: engine.setRules(sources, target, key, options) */
    setRules: (...args: any[]) => void;
    /** raw meshflow: engine.entangle(paths, options) - cyclic/bidirectional graph */
    entangle: (...args: any[]) => any;
};

export { type CheckboxField, type FormFieldSchema, type FormItemValidationFn, type FormItemValidationFns, type FormResultType, type FromDescriptor, type GroupField, type InputField, type MeshFieldSchema, type MeshFormSchema, type MeshGraph, type MeshObjectSchema, type NormalizeFormSchema, type RenderSchema, type RenderSchemaFn, type SelectField, deleteEngine, from, useEngine, useMeshForm, useMeshFormJson };
