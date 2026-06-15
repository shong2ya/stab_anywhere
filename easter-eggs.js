// 이스터에그: 사진 창 · 유튜브/링크 창 (분리, 낮은 확률)
(function (global) {
  global.EGG_TEMPLATES = {
    pachirisu: {
      image: "./assets/image.gif",
      imageAlt: "Pachirisu",
      youtube: "3Vs25NtikCM",
    },
    emolga: {
      image: "./assets/emolga.gif",
      imageAlt: "Emolga",
      youtube: "b4zd9PdsFcY",
    },
    tofu: {
      image: "./assets/emolga.gif",
      imageAlt: "Emolga",
      link: {
        label: "두부 레시피",
        url: "https://www.10000recipe.com/recipe/6983544",
      },
    },
    googleMap: {
      link: {
        label: "Google 지도",
        url: "https://share.google/lP1OtQPX8Cy3c5P6G",
      },
    },
    naverMap: {
      link: {
        label: "네이버 지도",
        url: "https://naver.me/5WOQesew",
      },
    },
  };

  // 전체 칸 중 이스터에그가 걸릴 확률 (0.16 ≈ 16%)
  global.EASTER_EGG_RATE = 0.16;

  // 이스터에그 칸에서 보여줄 내용 비율 (합 ≈ 1)
  global.EGG_PART_WEIGHTS = { image: 0.45, media: 0.45, both: 0.1 };

  // 파치리스·에몽가(유튜브) — 미디어 비중 높임
  global.EGG_YOUTUBE_PART_WEIGHTS = { image: 0.12, media: 0.53, both: 0.35 };

  // 파치리스·에몽가 각 30% · 나머지 링크 10%씩
  global.EGG_ROTATION = [
    "pachirisu",
    "emolga",
    "pachirisu",
    "emolga",
    "pachirisu",
    "emolga",
    "tofu",
    "googleMap",
    "naverMap",
    "pachirisu",
    "emolga",
  ];
})(typeof window !== "undefined" ? window : global);
