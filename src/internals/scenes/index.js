import ProcessScene, { pose as processPose } from './ProcessScene.jsx';
import NetworkScene, { pose as networkPose } from './NetworkScene.jsx';
import RenderScene, { pose as renderPose } from './RenderScene.jsx';
import DevToolsScene, { pose as devtoolsPose } from './DevToolsScene.jsx';
import RuntimeScene, { pose as runtimePose } from './RuntimeScene.jsx';
import ComponentsScene, { pose as componentsPose } from './ComponentsScene.jsx';
import ReconcileScene, { pose as reconcilePose } from './ReconcileScene.jsx';
import FiberScene, { pose as fiberPose } from './FiberScene.jsx';
import CommitScene, { pose as commitPose } from './CommitScene.jsx';
import HooksScene, { pose as hooksPose } from './HooksScene.jsx';
import SchedulerScene, { pose as schedulerPose } from './SchedulerScene.jsx';
import ConcurrentScene, { pose as concurrentPose } from './ConcurrentScene.jsx';
import ContextScene, { pose as contextPose } from './ContextScene.jsx';
import RerenderScene, { pose as rerenderPose } from './RerenderScene.jsx';
import EventsScene, { pose as eventsPose } from './EventsScene.jsx';
import RscScene, { pose as rscPose } from './RscScene.jsx';
import ReactReduxScene, { pose as reactreduxPose } from './ReactReduxScene.jsx';
import DataflowScene, { pose as dataflowPose } from './DataflowScene.jsx';
import StoreScene, { pose as storePose } from './StoreScene.jsx';
import ReducersScene, { pose as reducersPose } from './ReducersScene.jsx';
import MiddlewareScene, { pose as middlewarePose } from './MiddlewareScene.jsx';
import ThunkScene, { pose as thunkPose } from './ThunkScene.jsx';
import SelectorsScene, { pose as selectorsPose } from './SelectorsScene.jsx';
import RtkqScene, { pose as rtkqPose } from './RtkqScene.jsx';
import EcosystemScene, { pose as ecosystemPose } from './EcosystemScene.jsx';

export const SCENE_VIEWS = {
  process: { Component: ProcessScene, pose: processPose },
  network: { Component: NetworkScene, pose: networkPose },
  render: { Component: RenderScene, pose: renderPose },
  devtools: { Component: DevToolsScene, pose: devtoolsPose },
  runtime: { Component: RuntimeScene, pose: runtimePose },
  components: { Component: ComponentsScene, pose: componentsPose },
  reconcile: { Component: ReconcileScene, pose: reconcilePose },
  fiber: { Component: FiberScene, pose: fiberPose },
  commit: { Component: CommitScene, pose: commitPose },
  hooks: { Component: HooksScene, pose: hooksPose },
  scheduler: { Component: SchedulerScene, pose: schedulerPose },
  concurrent: { Component: ConcurrentScene, pose: concurrentPose },
  context: { Component: ContextScene, pose: contextPose },
  rerender: { Component: RerenderScene, pose: rerenderPose },
  events: { Component: EventsScene, pose: eventsPose },
  rsc: { Component: RscScene, pose: rscPose },
  reactredux: { Component: ReactReduxScene, pose: reactreduxPose },
  dataflow: { Component: DataflowScene, pose: dataflowPose },
  store: { Component: StoreScene, pose: storePose },
  reducers: { Component: ReducersScene, pose: reducersPose },
  middleware: { Component: MiddlewareScene, pose: middlewarePose },
  thunk: { Component: ThunkScene, pose: thunkPose },
  selectors: { Component: SelectorsScene, pose: selectorsPose },
  rtkq: { Component: RtkqScene, pose: rtkqPose },
  ecosystem: { Component: EcosystemScene, pose: ecosystemPose },
};
