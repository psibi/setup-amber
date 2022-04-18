import {
  getRelease,
  getLatestRelease,
  OS,
  associateOs,
  getAmberForMachine,
  Release,
} from "../src/main";
import * as process from "process";
import * as cp from "child_process";
import * as path from "path";
import { expect, test } from "@jest/globals";

test("three assets present for amber v0.1.3 version", async () => {
  const release = await getRelease("v0.1.3");
  expect(release.length).toBe(3);
});

test("no assets available for invalid version", async () => {
  const release = await getRelease("non_existent");
  expect(release.length).toBe(0);
});

test("latest release contains three assets", async () => {
  const release = await getLatestRelease();
  expect(release.length).toBe(3);
});

test("maps OS properly", async () => {
  expect(associateOs("amber-x86_64-unknown-linux-musl")).toBe(OS.Linux);
  expect(associateOs("amber-x86_64-pc-windows-gnu.exe")).toBe(OS.Windows);
  expect(associateOs("amber-x86_64-apple-darwin")).toBe(OS.Mac);
});

test("proper filtering happening for Linux", async () => {
  const releases = await getRelease("v0.1.3");
  const release = getAmberForMachine(releases);
  expect(release!.os).toBe(OS.Linux);
});
