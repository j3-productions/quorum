import React from 'react';
import cn from 'classnames';

export const Hero = ({content, className}: {content: string; className?: string;}) => {
  return (
    <div className={cn("text-center py-8", className)}>
      <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold tracking-tight mb-12">
        {content}
      </h1>
    </div>
  );
}

export const Spinner = ({className}: {className: string}) => {
  return (
    <div className='flex justify-center'>
      <svg className={cn('animate-spin', className)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
        <circle className="fill-bgp1 stroke-fgp1" cx="16" cy="16" r="13" strokeWidth="2"/>
        <path className="fill-fgp1" d="M22 14.0488H19.6306C19.4522 15.0976 18.9936 15.7317 18.1783 15.7317C16.7006 15.7317 15.8599 14 13.5669 14C11.3503 14 10.1783 15.3659 10 17.9756H12.3694C12.5478 16.9024 13.0064 16.2683 13.8471 16.2683C15.3248 16.2683 16.1146 18 18.4586 18C20.6242 18 21.8217 16.6341 22 14.0488Z" />
      </svg>
    </div>
  );
}

export const Failer = ({className}: {className: string}) => {
  return (
    <div className='flex justify-center'>
      <svg className={cn(className)} viewBox="0 -8 528 528" xmlns="http://www.w3.org/2000/svg" >
        <path className="fill-fgs1" d="M264 456Q210 456 164 429 118 402 91 356 64 310 64 256 64 202 91 156 118 110 164 83 210 56 264 56 318 56 364 83 410 110 437 156 464 202 464 256 464 310 437 356 410 402 364 429 318 456 264 456ZM264 288L328 352 360 320 296 256 360 192 328 160 264 224 200 160 168 192 232 256 168 320 200 352 264 288Z" />
      </svg>
    </div>
  );
}
