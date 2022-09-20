import cn from 'classnames';
import React from 'react';

export const Spinner = ({className}: {className: string}) => {
  return (
    <div className='flex justify-center'>
      <svg className={cn('animate-spin', className)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
        <circle className="fill-bgp1 stroke-fgp1" cx="16" cy="16" r="13" stroke-width="2"/>
        <path className="fill-fgp1" d="M22 14.0488H19.6306C19.4522 15.0976 18.9936 15.7317 18.1783 15.7317C16.7006 15.7317 15.8599 14 13.5669 14C11.3503 14 10.1783 15.3659 10 17.9756H12.3694C12.5478 16.9024 13.0064 16.2683 13.8471 16.2683C15.3248 16.2683 16.1146 18 18.4586 18C20.6242 18 21.8217 16.6341 22 14.0488Z" />
      </svg>
    </div>
  );
}
