import type { Av } from "../dm";

declare const require: (path: string) => {
  VERSION: number;
  DEFAULT_HERO_GENOME: AvatarGenome;
  compileAvatar: (genome: AvatarGenome, opts?: CompileAvatarOptions) => string;
  critiqueGenome: (genome: AvatarGenome) => FoundryCritique;
  genomeFromAv: (av: Av, ov?: Partial<Av>) => AvatarGenome;
  normalizeGenome: (genome: Partial<AvatarGenome>) => AvatarGenome;
  supportsAv: (av: Av, ov?: Partial<Av>) => boolean;
  validateGenome: (genome: unknown) => { ok: boolean; errors: string[] };
};

export type AvatarGenome = {
  version: 1;
  seed: string;
  anatomy: {
    body: string;
    height: string;
    stance: string;
    proportions: Record<string, number>;
  };
  identity: {
    skin: string;
    faceShape: string;
    brow: string;
    eye: string;
    eyeColor: string;
    nose: string;
    lip: string;
    expression: string;
  };
  hair: {
    family: string;
    style: string;
    volume: number;
    color: string;
  };
  outfit: {
    top: string;
    bottom: string;
    shoe: string;
    palette: string;
    topColor?: string;
    bottomColor?: string;
  };
  assistive: {
    mobility?: string;
    aac?: string;
    hearing?: string;
    glasses?: string;
  };
  artDirection: {
    lineWeight: number;
    softness: number;
    detailLevel: number;
    editorialWarmth: number;
  };
};

export type CompileAvatarOptions = {
  crop?: "full" | "bust";
  debug?: boolean;
};

export type FoundryCritique = {
  id: string;
  overall: number;
  scores: Record<string, number>;
  findings: { code: string; severity: number; message: string }[];
};

const runtime = require("./dmFigureV2.runtime.js");

export const foundryHeroGenome = runtime.DEFAULT_HERO_GENOME;
export const compileAvatar = runtime.compileAvatar;
export const critiqueGenome = runtime.critiqueGenome;
export const genomeFromAv = runtime.genomeFromAv;
export const normalizeGenome = runtime.normalizeGenome;
export const supportsFoundryAv = runtime.supportsAv;
export const validateGenome = runtime.validateGenome;

export default compileAvatar;
