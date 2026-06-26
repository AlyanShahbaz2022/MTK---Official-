import { BannerCarousel } from '@/components/home/banner-carousel';
import { NewIn } from '@/components/home/new-in';
import { CategoryGrid } from '@/components/home/category-grid';
import { Marquee } from '@/components/home/marquee';
import { PromoDuo } from '@/components/home/promo-duo';
import { ServiceStrip } from '@/components/home/service-strip';
import { EditorialSplit } from '@/components/home/editorial-split';

export default function HomePage() {
  return (
    <>
      <BannerCarousel />
      <NewIn />
      <CategoryGrid />
      <Marquee />
      <PromoDuo />
      <EditorialSplit />
      <ServiceStrip />
    </>
  );
}
