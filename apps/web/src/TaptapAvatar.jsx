import React from "react";

const TaptapAvatar = ({ src }) =>
  src
    ? <img src={src} alt="Taptap" className="taptap-avatar" />
    : <div className="taptap-avatar-fallback">🐝</div>;

export default TaptapAvatar;