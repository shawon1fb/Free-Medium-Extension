const KNOWN_MEDIUM_CUSTOM_DOMAINS: string[] = [
    "javascript.plainenglish.io",
    "blog.llamaindex.ai",
    "code.likeagirl.io",
    "medium.datadriveninvestor.com",
    "blog.det.life",
    "python.plainenglish.io",
    "blog.stackademic.com",
    "ai.gopubby.com",
    "blog.devops.dev",
    "levelup.gitconnected.com",
    "betterhumans.coach.me",
    "ai.plainenglish.io",
];

const KNOWN_MEDIUM_DOMAINS: string[] = [
    "medium.com",
    "uxplanet.org",
    "osintteam.blog",
    "ahmedelfakharany.com",
    "drlee.io",
    "artificialcorner.com",
    "generativeai.pub",
    "productcoalition.com",
    "towardsdev.com",
    "infosecwriteups.com",
    "towardsdatascience.com",
    "thetaoist.online",
    "devopsquare.com",
    "laceydearie.com",
    "bettermarketing.pub",
    "itnext.io",
    "eand.co",
    "betterprogramming.pub",
    "curiouse.co",
    "betterhumans.pub",
    "uxdesign.cc",
    "thebolditalic.com",
    "arcdigital.media",
    "codeburst.io",
    "psiloveyou.xyz",
    "writingcooperative.com",
    "entrepreneurshandbook.co",
    "prototypr.io",
    "theascent.pub",
    "storiusmag.com",
];

// Generate patterns like '*://*.medium.com/*' and '*://medium.com/*'
export const knownMediumDomainPatterns: string[] = [
    ...KNOWN_MEDIUM_CUSTOM_DOMAINS,
    ...KNOWN_MEDIUM_DOMAINS,
].flatMap((domain) => [`*://*.${domain}/*`, `*://${domain}/*`]);

// console.log(domainPatterns);
