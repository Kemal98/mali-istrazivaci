import { describe, expect, it } from "vitest";
import {
  splitAddress,
  phoneForA2B,
  extractPostalCode,
  formatWeight,
  formatMoney,
} from "./a2bFormat";

describe("splitAddress", () => {
  it("gole cifre na kraju -> broj kao BROJ", () => {
    expect(splitAddress("Armije bih 386")).toEqual({ ulica: "Armije bih", broj: 386 });
  });

  it("'br.' prefiks ispred broja se briše", () => {
    expect(splitAddress("Omladinskih radnih brigada br. 8")).toEqual({
      ulica: "Omladinskih radnih brigada",
      broj: 8,
    });
  });

  it("'bb' (bilo koja kombinacija velikih/malih slova) -> 'bb' kao tekst", () => {
    expect(splitAddress("Titova bb")).toEqual({ ulica: "Titova", broj: "bb" });
    expect(splitAddress("Titova BB")).toEqual({ ulica: "Titova", broj: "bb" });
    expect(splitAddress("Titova Bb")).toEqual({ ulica: "Titova", broj: "bb" });
  });

  it("cifre/cifre -> tekst", () => {
    expect(splitAddress("Braće Jugovića 29/1")).toEqual({
      ulica: "Braće Jugovića",
      broj: "29/1",
    });
  });

  it("cifre+slovo -> tekst", () => {
    expect(splitAddress("Neka ulica 3a")).toEqual({ ulica: "Neka ulica", broj: "3a" });
    expect(splitAddress("Neka ulica 97b")).toEqual({ ulica: "Neka ulica", broj: "97b" });
  });

  it("adresa sa riječi 'kod' se ne razdvaja", () => {
    expect(splitAddress("Vida Nježića kod broja 18")).toEqual({
      ulica: "Vida Nježića kod broja 18",
      broj: "",
    });
  });

  it("adresa bez prepoznatljivog broja se ne razdvaja", () => {
    expect(splitAddress("Neka ulica bez broja")).toEqual({
      ulica: "Neka ulica bez broja",
      broj: "",
    });
  });

  it("prazna adresa", () => {
    expect(splitAddress("")).toEqual({ ulica: "", broj: "" });
  });
});

describe("phoneForA2B", () => {
  it("+387 prefiks -> vodeća nula", () => {
    expect(phoneForA2B("+38761400866")).toBe("061400866");
  });
  it("00387 prefiks -> vodeća nula", () => {
    expect(phoneForA2B("0038761400866")).toBe("061400866");
  });
  it("387 prefiks (bez +) -> vodeća nula", () => {
    expect(phoneForA2B("38761400866")).toBe("061400866");
  });
  it("razmaci/crtice/kose crte/zagrade se uklanjaju", () => {
    expect(phoneForA2B("061 400 866")).toBe("061400866");
    expect(phoneForA2B("061-400-866")).toBe("061400866");
    expect(phoneForA2B("(061) 400/866")).toBe("061400866");
  });
  it("već ima vodeću nulu", () => {
    expect(phoneForA2B("061400866")).toBe("061400866");
  });
});

describe("extractPostalCode", () => {
  it("koristi postojeći postalCode ako je upisan", () => {
    expect(extractPostalCode("Doboj", "74000")).toEqual({
      city: "Doboj",
      postalCode: "74000",
    });
  });

  it("izvlači petocifreni broj sa kraja grada", () => {
    expect(extractPostalCode("Doboj 74000", "")).toEqual({
      city: "Doboj",
      postalCode: "74000",
    });
  });

  it("izvlači petocifreni broj sa početka grada i velikim slovom imena", () => {
    expect(extractPostalCode("75240 lopare", "")).toEqual({
      city: "Lopare",
      postalCode: "75240",
    });
  });

  it("nema poštanskog broja nigdje -> prazno, ništa se ne izmišlja", () => {
    expect(extractPostalCode("Sarajevo", "")).toEqual({
      city: "Sarajevo",
      postalCode: "",
    });
  });
});

describe("formatWeight", () => {
  it("cijeli broj -> tri decimale sa zarezom", () => {
    expect(formatWeight(1)).toBe("1,000");
  });
  it("decimalna vrijednost", () => {
    expect(formatWeight(0.5)).toBe("0,500");
  });
  it("nepoznata težina (undefined) -> 1,000", () => {
    expect(formatWeight(undefined)).toBe("1,000");
  });
});

describe("formatMoney", () => {
  it("dvije decimale sa zarezom", () => {
    expect(formatMoney(29)).toBe("29,00");
    expect(formatMoney(79.99)).toBe("79,99");
  });
});
