import React, { useState, useEffect } from 'react';
import api from '~/api';


export default function ChannelGrid() {
  // TODO: Query all channels, including parsing through image rendering info
  // TODO: Display like diary grid mode in %groups

  useEffect(() => {
    api.scry({
      app: "groups",
      path: `/groups`,
    }).then((result) => {
      // const letmeknow = Object.entries(result).reduce((list, [flag, group]) => (
      //   list.concat(channels)
      // ), []);
      console.log(result);
    });
  }, []);

  return (
    <p>
      Hello, world!
    </p>
  );
}
