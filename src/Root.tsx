import { Composition } from "remotion";
import { HelloVideo } from "./HelloVideo";
import { SizzleReel } from "./videos/SizzleReel";
import { MatrixRedaction } from "./videos/MatrixRedaction";
import { TerminalDemo } from "./videos/TerminalDemo";
import { HashCascade } from "./videos/HashCascade";
import { SearchModes } from "./videos/SearchModes";
import { GlitchTrust } from "./videos/GlitchTrust";
import { JerrySlam } from "./videos/JerrySlam";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="JerrySlam"
        component={JerrySlam}
        durationInFrames={1949}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SizzleReel"
        component={SizzleReel}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MatrixRedaction"
        component={MatrixRedaction}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TerminalDemo"
        component={TerminalDemo}
        durationInFrames={1170}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="HashCascade"
        component={HashCascade}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SearchModes"
        component={SearchModes}
        durationInFrames={1050}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="GlitchTrust"
        component={GlitchTrust}
        durationInFrames={465}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="HelloVideo"
        component={HelloVideo}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
