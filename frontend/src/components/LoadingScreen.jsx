import React from 'react'
function LoadingScreen() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <img src={require("../loading.gif")} alt="loading" style={{ height: 200, width: 200 }} />
    </div>
  )
}

export default LoadingScreen;